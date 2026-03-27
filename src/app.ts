// FILE FOR TESTING CALLS TO THE SERVER WITHOUT STARTING IT
import Server from './models/Server';

const server = new Server();

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
}

export default server.app;