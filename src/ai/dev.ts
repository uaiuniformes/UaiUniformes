import {config} from 'dotenv';
config();

import './flows/generate-whatsapp-notification';
import './flows/generate-internal-notification';
import './flows/extract-receipt-info';
import './flows/answer-question-from-manual';
