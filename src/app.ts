// FILE FOR TESTING CALLS TO THE SERVER WITHOUT STARTING IT
import Server from './models/Server';

const server = new Server();

export default server.app;