import path from 'path';
import { cwd } from 'process';
import multer from 'multer';

const store = multer.diskStorage({
	destination: path.join(cwd(), 'profiles/'),
	filename: (req, file, cb) => {
		cb(null, file.originalname);
	}
});

export default multer({ storage: store });