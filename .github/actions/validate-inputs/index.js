// Import the GitHub Actions core library for action development
const core = require('@actions/core');
// Import the semver library for semantic versioning validation
const semver = require('semver');

// Define the main asynchronous function that runs the action
async function run() {
  // Wrap all logic in try-catch for error handling
  try {
    // Get the 'environment' input from the action configuration (required)
    const environment = core.getInput('environment', { required: true });
    // Get the 'version' input from the action configuration (required)
    const version = core.getInput('version', { required: true });
    // Get the 'port' input from the action configuration (optional, defaults to 8080)
    const port = core.getInput('port');
    // Get the 'enable-ssl' input from the action configuration (optional, defaults to true)
    const enableSSL = core.getInput('enable-ssl');
    
    // Initialize validation flag to track if all inputs are valid
    let isValid = true;
    // Initialize empty array to collect validation error messages
    const errors = [];
    
    // Define array of valid environment values
    const validEnvironments = ['development', 'staging', 'production'];
    // Check if the provided environment is in the list of valid environments
    if (!validEnvironments.includes(environment)) {
      // Add error message to errors array if environment is invalid
      errors.push(`Invalid environment: ${environment}. Must be one of: ${validEnvironments.join(', ')}`);
      // Set validation flag to false
      isValid = false;
    } else {
      // Log the valid environment value to the action output
      core.info(`Environment: ${environment}`);
    }
    
    // Validate version using semver library to ensure it's a valid semantic version
    if (!semver.valid(version)) {
      // Add error message if version is not valid semver format
      errors.push(`Invalid version: ${version}. Must be valid semver (e.g., 1.0.0)`);
      // Set validation flag to false
      isValid = false;
    } else {
      // Log the valid version to the action output
      core.info(`Version: ${version}`);
    }
    
    // Parse the port string to an integer
    const portNumber = parseInt(port, 10);
    // Check if port is a valid number and within valid range (1-65535)
    if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
      // Add error message if port is invalid
      errors.push(`Invalid port: ${port}. Must be between 1 and 65535`);
      // Set validation flag to false
      isValid = false;
    } else {
      // Log the valid port number to the action output
      core.info(`Port: ${portNumber}`);
    }
    
    // Validate that enable-ssl input is either 'true' or 'false' (case insensitive)
    if (!['true', 'false'].includes(enableSSL.toLowerCase())) {
      // Add error message if enable-ssl value is not a boolean string
      errors.push(`Invalid enable-ssl: ${enableSSL}. Must be true or false`);
      // Set validation flag to false
      isValid = false;
    } else {
      // Log the SSL enabled status to the action output
      core.info(`SSL Enabled: ${enableSSL}`);
    }
    
    // Check if any validation errors occurred
    if (!isValid) {
      // Log error header message
      core.error('Validation failed with the following errors:');
      // Iterate through each error and log it
      errors.forEach(error => core.error(`  - ${error}`));
      // Mark the action as failed and exit early
      core.setFailed('Input validation failed');
      // Return to exit the function
      return;
    }
    
    // Create configuration object with validated inputs
    const config = {
      // Store the environment value
      environment,
      // Store the version value
      version,
      // Store the parsed port number
      port: portNumber,
      // Convert SSL string to boolean (true if 'true', false otherwise)
      ssl: enableSSL === 'true',
      // Store the current ISO timestamp
      timestamp: new Date().toISOString()
    };
    
    // Set the 'validated' output to 'true' indicating successful validation
    core.setOutput('validated', 'true');
    // Set the 'config' output with the stringified JSON configuration object
    core.setOutput('config', JSON.stringify(config));
    
    // Create a job summary with a heading
    core.summary
      // Add heading to the summary
      .addHeading('Validation Successful')
      // Add formatted JSON code block to the summary
      .addCodeBlock(JSON.stringify(config, null, 2), 'json')
      // Write the summary to be displayed in the action logs
      .write();
    
    // Log success message to the action output
    core.info('All inputs validated successfully!');
    
  } catch (error) {
    // Catch any unexpected errors and mark the action as failed
    core.setFailed(`Action failed: ${error.message}`);
  }
}

// Execute the run function to start the action
run();
