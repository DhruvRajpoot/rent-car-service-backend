import express from "express";
import { signup, getAccessToken, login, forgotpassword, sendresetcode} from '../Controller/AuthController.js';

const router = express.Router()

router.post('/signup', signup);
router.post('/login', login);
router.post('/getaccesstoken', getAccessToken);
router.post('/sendresetcode/:purpose', sendresetcode)
router.post('/forgotpassword', forgotpassword);

export default router;