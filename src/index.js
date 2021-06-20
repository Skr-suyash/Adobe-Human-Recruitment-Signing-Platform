// Imports
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session');

const config = require('../config'); // Configuration file for the project

const main = require('./routers/main');

// Express settings
const app = express();
const staticDir = path.join(__dirname, '../static');
app.use(express.static(staticDir));

// Set up express-handlebars and layouts
app.engine('.hbs', exphbs({
    extname: '.hbs',
    helpers: {
        // Helper function equivalent to a !== b
        ifnoteq(a, b, options) {
            if (a !== b) {
                return options.fn(this);
            }
            return options.inverse(this);
        },
        // Helper function equivalent to a === b
        ifeq(a, b, c, options) {
            if (a === b) {
                return options.fn(this);
            } if (a === c) {
                return options.fn(this);
            }
            return options.inverse(this);
        },
    },
}));
app.set('view engine', '.hbs');

// Set up exchange and parsing of request
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));
// Routers
app.use(main);

// Defining the Routes

// Start the server at port (9000)
const { PORT } = config;

// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
