// Imports
const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFToolsSdk = require('@adobe/documentservices-pdftools-node-sdk');
const config = require('../../config');

// utilities
const editPDF = require('../util/pdfFunctions');
const sanitizeComment = require('../util/sanitizeComment');

const router = new express.Router();

// Memory
const users = [];
const comments = [];

/**
 * Midddleware to check for authentication in routes
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
function isAuthenticated(req, res, next) {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/'); // Redirect to login screen
    }
}

/**
 * Login Page
 */
router.get('/', (req, res) => {
    res.render('home', {
        layout: false,
    });
});

router.post('/', (req, res) => {
    const { username, password } = req.body;

    // Check if user exists.
    const foundUser = users.find((user) => user.username === username);
    if (!foundUser) {
        res.render('home', { layout: false, error: 'User not Found' });
        // Check if password matches or not
    } else if (foundUser.password !== password) {
        res.render('home', { layout: false, error: 'Invalid Password' });
    } else if (foundUser.password === password) {
        req.session.loggedIn = true;
        // Redirect the user to correct Dashboard Page
        if (foundUser.companyName) {
            res.redirect(`/dashboard/company/${foundUser.companyName}/${foundUser.username}`);
        } else {
            res.redirect(`/dashboard/candidate/${foundUser.company}/${foundUser.username}`);
        }
    }
});

/**
 * Register Page
 */
router.get('/register', (req, res) => {
    res.render('register', {
        layout: false,
    });
});

router.post('/register', (req, res) => {
    const { role } = req.body;
    if (role === 'Company') {
        const { companyName, companyUsername, companyPassword } = req.body;
        // Check if user already exists
        const exists = users.find((user) => user.username === companyUsername);
        if (exists) {
            res.render('register', { layout: false, error: 'Username already exists' });
        } else {
            // Push data to memory
            req.session.loggedIn = true;
            users.push({
                companyName,
                username: companyUsername,
                password: companyPassword,
                contracts: [],
            });
            res.redirect(`/dashboard/company/${companyName}/${companyUsername}`);
        }
    } else {
        // Do the same for candidate
        const {
            candidateName, candidateUsername, company, candidatePassword,
        } = req.body;
        // Check if username already exists
        const exists = users.find((user) => user.username === candidateUsername);
        // Check if company exists
        const companyExists = users.find((user) => user.companyName === company);
        if (exists) {
            res.render('register', { layout: false, error: 'Username already exists' });
        } else if (!companyExists) {
            res.render('register', { layout: false, error: 'The Company does not exists' });
        } else {
            req.session.loggedIn = true;
            users.push({
                candidateName,
                username: candidateUsername,
                password: candidatePassword,
                company,
                contracts: [],
            });
            res.redirect(`/dashboard/candidate/${company}/${candidateUsername}/`);
        }
    }
});

/**
 * Render company Dashboard
 * Takes {company}, {username} as query params
 */
router.get('/dashboard/company/:company/:username', isAuthenticated, (req, res) => {
    const { company, username } = req.params;
    const candidates = users.filter((user) => user.company === company);
    res.render('companyDashboard', {
        layout: false,
        company,
        username,
        candidates,
    });
});

/**
 * Render Candidate Dashboard
 * Takes {company}, {username} as query params
 */
router.get('/dashboard/candidate/:company/:username', isAuthenticated, (req, res) => {
    const { company, username } = req.params;
    const candidate = users.filter((user) => user.username === username);
    res.render('candidateDashboard', {
        layout: false,
        company,
        username,
        candidate,
    });
});

/**
 * Route which initiates a contract and creates different copies for users
 */
router.post('/initiate-contract', (req, res) => {
    const { contractName, candidates } = req.body;
    // Check if contract already exists
    if (!fs.existsSync(`static/output/${contractName}.pdf`)) {
        for (let i = 0; i < candidates.length; i += 1) {
            for (let j = 0; j < users.length; j += 1) {
                if (users[j].username === candidates[i]) {
                    users[j].contracts.push({
                        name: contractName,
                        status: 'Draft',
                    });
                }
            }
        }
        // Copy the blank PDF as a new contract
        const sourcePath = path.join(__dirname, '../../static/blank.pdf');
        const outputPath = path.join(__dirname, `../../static/output/${contractName}.pdf`);
        fs.copyFileSync(sourcePath, outputPath);
        res.send();
    } else {
        res.status(404).send('Contract already exists');
    }
});

/**
 * Route to render the PDF Viewer
 * Takes {username}, {fileName} as query params
 * Also takes {candidateUsername} as query string
 */
router.get('/pdfViewer/:username/:fileName', isAuthenticated, (req, res) => {
    const { fileName, username } = req.params;
    const { candidate } = req.query;
    res.render('pdfViewer', {
        layout: false,
        fileName,
        username,
        candidate,
        client_id: config.VIEW_SDK_CLIENT_ID,
    });
});

/**
 * Render the Edit PDF Page
 * Takes {username (Company User)}, {companyName}, {fileName} as query params
 */
router.get('/editPDF/:user/:company/:fileName', isAuthenticated, (req, res) => {
    const { fileName, user, company } = req.params;
    res.render('editPDF', {
        layout: false, fileName, user, company,
    });
});

/**
 * Function to process the PDF
 */
router.post('/processPDF', async (req, res) => {
    const {
        fileName,
        createFile,
        deletePages,
        reorderPages,
        mergableList,
        fileNameToBeInserted,
        pageInsert,
        pageInsertSource,
    } = req.body;
    try {
        // Initial setup, create credentials instance.
        const credentials = PDFToolsSdk.Credentials
            .serviceAccountCredentialsBuilder()
            .fromFile('pdftools-api-credentials.json')
            .build();

        // Call the editPDF util
        await editPDF(credentials,
            String(fileName),
            String(createFile),
            reorderPages,
            mergableList,
            String(fileNameToBeInserted),
            pageInsert,
            pageInsertSource,
            deletePages);
        res.send();
    } catch (err) {
        res.status(400).send(err);
        // eslint-disable-next-line no-console
        console.log('Exception encountered while executing operation', err);
    }
});

/**
 * Route to set the status of contract as Finalized
 */
router.post('/finalize-contract', (req, res) => {
    const { contractName } = req.body;
    // Find the contract, set the status
    for (let i = 0; i < users.length; i += 1) {
        for (let j = 0; j < users[i].contracts.length; j += 1) {
            if (users[i].contracts[j].name === contractName) {
                users[i].contracts[j].status = 'Finalized';
            }
        }
    }
    res.send();
});

/**
 * Function to display the signing page
 * Takes { role } as query params
 */
router.get('/signPage/:role', isAuthenticated, (req, res) => {
    const { role } = req.params;
    res.render('signPage', { layout: false, role });
});

/**
 * Route to post and save the comment in the PDF Viewer
 */
router.post('/post-comment', (req, res) => {
    const {
        id, fileName, comment, candidate,
    } = req.body;
    // Sanitize the input by converting required values to numbers
    const sanitizedComment = sanitizeComment(comment);
    // Push comment to the memory
    const found = comments.find((el) => el.id === id);
    if (!found) {
        comments.push({
            id,
            fileName,
            candidate,
            comment: sanitizedComment,
        });
    }
    res.send();
});

/**
 * Function to delete a comment
 */
router.post('/delete-comment', (req, res) => {
    const { id } = req.body;
    const index = comments.findIndex((comment) => comment.id === id);
    comments.splice(index, 1);
    res.send();
});

/**
 * Route to fetch all the comments from memory
 */
router.post('/getComments', (req, res) => {
    const { fileName, candidate } = req.body;
    const commentsToBeDisplayed = [];
    // Filter the comments on the basis of Filename and user
    for (let index = 0; index < comments.length; index += 1) {
        if (comments[index].fileName === fileName && comments[index].candidate === candidate) {
            commentsToBeDisplayed.push(comments[index].comment);
        }
    }
    res.send(commentsToBeDisplayed);
});

/**
 * Function to update the comment if the user edits it
 */
router.post('/edit-comment', (req, res) => {
    const { id, comment } = req.body;
    // Sanitize the received comment
    const sanitizedComment = sanitizeComment(comment);
    const foundComment = comments.find((el) => el.id === id);
    foundComment.comment = sanitizedComment;
    res.send();
});

/**
 * Function to change the status of the contract
 */
router.post('/changeStatus', (req, res) => {
    const {
        contractName, candidate, role, task,
    } = req.body;
    // Find the contract
    const foundUser = users.find((user) => user.username === candidate);
    const foundContract = foundUser.contracts.find(
        (contract) => contract.name === contractName,
    );
    // Check what changes need to be made
    // Change status to approved if not approved
    if (task === 'Approve') {
        if (role === 'Company') {
            if (foundContract.status === 'Approved by Candidate') {
                foundContract.status = 'Approved';
            } else {
                foundContract.status = 'Approved by Company';
            }
        } else if (role === 'Candidate') {
            if (foundContract.status === 'Approved by Company') {
                foundContract.status = 'Approved';
            } else {
                foundContract.status = 'Approved by Candidate';
            }
        }
        // Change status to signed if not signed
    } else if (task === 'Sign') {
        if (role === 'Company') {
            if (foundContract.status === 'Signed by Candidate') {
                foundContract.status = 'Signed';
            } else {
                foundContract.status = 'Signed by Company';
            }
        } else if (role === 'Candidate') {
            if (foundContract.status === 'Signed by Company') {
                foundContract.status = 'Signed';
            } else {
                foundContract.status = 'Signed by Candidate';
            }
        }
        // Set status to cancelled if user cancels the contract
    } else if (task === 'Cancel') {
        foundContract.status = 'Cancelled';
    }
    res.send();
});

/**
 * Function to delete a contract and remove it from memory
 */
router.post('/deleteContract', (req, res) => {
    const { candidate, contractName } = req.body;
    const foundUser = users.find((user) => user.username === candidate);
    foundUser.contracts = foundUser.contracts.filter(
        (contract) => contract.name !== contractName,
    );
    res.send();
});

module.exports = router;
