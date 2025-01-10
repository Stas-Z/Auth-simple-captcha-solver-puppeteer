import * as fs from 'fs';

export function readFileAsBase64(filePath: string): string {
    return fs.readFileSync(filePath, 'base64');
}
