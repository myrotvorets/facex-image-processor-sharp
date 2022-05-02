import sharp, { Sharp } from 'sharp';
import { BadImageError, IImageProcessor } from '@myrotvorets/facex-base';

interface ImageMeta {
    isJPEG: boolean;
    chromaSubsampling: string;
    isProgressive: boolean;
}

export class ImageProcessorSharp implements IImageProcessor {
    // eslint-disable-next-line class-methods-use-this
    public async process(stream: NodeJS.ReadableStream): Promise<string> {
        const img = ImageProcessorSharp._loadImage(stream);
        const meta = await ImageProcessorSharp._extractImageMeta(img);

        const flag = !meta.isJPEG || meta.chromaSubsampling !== '4:2:0' || meta.isProgressive;
        if (flag) {
            img.jpeg({ progressive: false, chromaSubsampling: '4:2:0' });
        }

        img.rotate();
        const buf = await img.toBuffer();
        return buf.toString('base64');
    }

    private static _loadImage(stream: NodeJS.ReadableStream): Sharp {
        const img = sharp({ failOnError: false, sequentialRead: true });
        stream.pipe(img);
        return img;
    }

    private static async _extractImageMeta(img: Sharp): Promise<ImageMeta> {
        try {
            const meta = await img.metadata();
            return {
                isJPEG: meta.format === 'jpeg',
                chromaSubsampling: meta.chromaSubsampling || '',
                isProgressive: !!meta.isProgressive,
            };
        } catch (e) {
            throw new BadImageError((e as Error).message);
        }
    }
}
