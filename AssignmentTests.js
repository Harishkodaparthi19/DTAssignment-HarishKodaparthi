import { Selector } from 'testcafe';
import readline from 'readline';
import { ClientFunction } from 'testcafe';

// Define the fixture for the SDLMS Login tests and set the page URL to the login page of the application.
fixture('SDLMS Login')
    .page('https://beta.deepthought.education/login');

// Function to get user inputs (username and password) using the readline module.
const getUserInputs = async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Enter your username: ', (username) => {
            rl.question('Enter your password: ', (password) => {
                rl.close();
                resolve({ username, password });
            });
        });
    });
};

// Function to automate the login process using provided username and password.
const login = async (t, username, password) => {
    await t
        .typeText('#username', username)
        .typeText('#password', password)
        .click('button[type="submit"]');
};

// Test: Automate login with user-provided credentials
test.before(async t => {
    // Get user inputs and store them in the test context.
    const { username, password } = await getUserInputs();
    t.ctx.username = username;
    t.ctx.password = password;
})
('Automate login with user-provided credentials', async t => {
    await login(t, t.ctx.username, t.ctx.password);

    // Check if the dashboard element or error message element exists and log appropriate messages.
    const dashboardExists = await Selector('#dashboard').exists;
    const errorMessageExists = await Selector('.error-message').exists;
    
    if (dashboardExists) {
        console.log('Login successful. User is on the dashboard.');
    } else if (errorMessageExists) {
        const errorMessage = await Selector('.error-message').innerText;
        console.log('Login failed. Error message:', errorMessage);
    } else {
        console.log('Login attempt result could not be determined.');
    }
});

// Test: Test successful login with valid credentials
test('Test successful login with valid credentials', async t => {
    // Get user inputs and store the dashboard element selector.
    const { username, password } = await getUserInputs();
    const dashboardElement = Selector('#dashboard');
    console.log(await dashboardElement.exists); // Log if the dashboard element exists before login.

    await login(t, t.ctx.username, t.ctx.password);
    await t.expect(Selector('#dashboard').exists).ok(); // Assert that the dashboard element exists.
});

// Test: Test unsuccessful login attempts with invalid credentials
test('Test unsuccessful login attempts with invalid credentials', async t => {
    await login(t, t.ctx.username, t.ctx.password);
    await t.expect(Selector('.error-message').exists).ok(); // Assert that the error message element exists.
});

// Test: Validate appropriate error messages for invalid login attempts
test('Validate appropriate error messages for invalid login attempts', async t => {
    await login(t, t.ctx.username, t.ctx.password);
    await t.expect(Selector('.error-message').exists).ok(); // Assert that the error message element exists.
    await t.expect(Selector('.error-message').innerText).eql('Invalid username or password'); // Assert error message content.
});

// Test: On successful login, validate redirection to the dashboard screen
test('On successful login, validate redirection to the dashboard screen', async t => {
    await login(t, t.ctx.username, t.ctx.password);
    await t.expect(Selector('#dashboard').exists).ok(); // Assert that the dashboard element exists.
});

// Cross-browser testing
const getUrl = ClientFunction(() => window.location.href);

// Define an array of browsers for cross-browser testing.
const browsers = ['chrome', 'firefox'];

// Iterate through each browser and perform cross-browser testing.
browsers.forEach(browser => {
    test
        .page('https://beta.deepthought.education/login')
        .before(async t => {
            // Get user inputs and store them in the test context.
            const { username, password } = await getUserInputs();
            t.ctx.username = username;
            t.ctx.password = password;
        })
        (`Cross-browser test: ${browser}`, async t => {
            // Perform actions using the adminRole (assumed role for cross-browser testing).
            await t.useRole(adminRole);
            await login(t, t.ctx.username, t.ctx.password);
            await t.expect(Selector('#dashboard').exists).ok(); // Assert that the dashboard element exists.
        });
});
