require( 'dotenv' ).config();
require( 'colors' );

import express from 'express';
import Server from './models/Server';

const server = new Server();

(BigInt.prototype as any).toJSON  = function () {
    return parseInt(this.toString());
};

server.execute();