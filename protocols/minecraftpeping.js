const async = require('async');

class MinecraftPEPing extends require('./core') {
    constructor() {
        super();
        this.magic = [0x00,0xff,0xff,0x00,0xfe,0xfe,0xfe,0xfe,0xfd,0xfd,0xfd,0xfd,0x12,0x34,0x56,0x78];

        this.sessionId = 1;
        this.encoding = 'utf8';
        this.byteorder = 'be';
    }

    run(state) {
        async.series([
            (c) => {
                // ID
                const ID = Buffer.alloc(1);
                ID.writeUInt8(0x01);

                // Ping ID
                const pingID = Buffer.alloc(8);
                pingID.writeUIntBE(0xff, 0, 8); // random

                // Write Magic
                const magic = Buffer.from(this.magic);

                // concatenation
                const b = Buffer.concat([ID, pingID, magic]);

                this.udpSend(b, (buffer) => {
                    const reader = this.reader(buffer);
                    var ID = reader.uint(1);
                    var pingID = reader.uint(8);
                    var serverID = reader.uint(8);
                    var magic = reader.uint(16);
                    var serverNameLen = reader.uint(4);
                    var serverName = reader.string(serverNameLen);

                    var token = serverName.split(/(?<!\\);/);
                    var raw = {
                        hostname: token[1],
                        version: token[3],
                        numplayers: parseInt(token[4]),
                        maxplayers: parseInt(token[5]),
                        server_engine: token[7]
                    };

                    state.raw = raw;

                    state.name = state.raw.hostname;
                    state.maxplayers = state.raw.maxplayers;

                    this.finish(state);
                });
            }
        ]);
    }
}

module.exports = MinecraftPEPing;
