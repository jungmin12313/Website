import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const dir = 'public';

async function convert() {
  const files = await fs.readdir(dir);
  for (const file of files) {
    if (file.match(/\.(png|jpg|jpeg)$/)) {
      const ext = path.extname(file);
      const base = path.basename(file, ext);
      await sharp(path.join(dir, file))
        .webp()
        .toFile(path.join(dir, `${base}.webp`));
      console.log(`Converted ${file}`);
    }
  }
}

convert().catch(console.error);
