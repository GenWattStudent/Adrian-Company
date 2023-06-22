"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const globalError_1 = __importDefault(require("./src/errors/globalError"));
const path_1 = __importDefault(require("path"));
const AuthDatabase_1 = __importDefault(require("./src/db/AuthDatabase"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_ejs_layouts_1 = __importDefault(require("express-ejs-layouts"));
const Authenticate_1 = __importDefault(require("./src/services/Authenticate"));
const index_1 = __importDefault(require("./src/routes/index"));
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
        this.auth = new Authenticate_1.default();
        this.authDatabase = new AuthDatabase_1.default(process.env.MONGODB_URI || '');
    }
    initMiddlewares() {
        this.app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
        this.app.use(express_1.default.json());
        this.app.use((0, cookie_parser_1.default)());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.set('views', path_1.default.join(__dirname, 'views'));
        this.app.set('view engine', 'ejs');
        this.app.set('layout', 'layouts/layout');
        this.app.use(express_ejs_layouts_1.default);
        this.authDatabase.connect();
        this.app.use('/', index_1.default);
        // Global error handler
        this.app.use(globalError_1.default);
    }
    start() {
        this.initMiddlewares();
        this.app.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}`);
        });
    }
}
const server = new Server();
server.start();
