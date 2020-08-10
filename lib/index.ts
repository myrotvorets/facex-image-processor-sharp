import sharp, { Sharp } from 'sharp';
import { BadImageError, IImageProcessor } from '@myrotvorets/facex-base';

interface ImageMeta {
    isJPEG: boolean;
    chromaSubsampling: string;
    isProgressive: boolean;
}

export class ImageProcessorSharp implements IImageProcessor {
    public async process(stream: NodeJS.ReadableStream): Promise<string> {
        const img = this._loadImage(stream);
        const meta = await this._extractImageMeta(img);

        const flag = !meta.isJPEG || meta.chromaSubsampling !== '4:2:0' || meta.isProgressive;
        if (flag) {
            img.jpeg({ progressive: false, chromaSubsampling: '4:2:0' });
        }

        const buf = await img.toBuffer();
        return buf.toString('base64');
    }

    private _loadImage(stream: NodeJS.ReadableStream): Sharp {
        const img = sharp({ failOnError: false, sequentialRead: true });
        stream.pipe(img);
        return img;
    }

    private _extractImageMeta(img: Sharp): Promise<ImageMeta> {
        return img
            .metadata()
            .then(
                (meta): ImageMeta => ({
                    isJPEG: meta.format === 'jpeg',
                    chromaSubsampling: meta.chromaSubsampling || '',
                    isProgressive: !!meta.isProgressive,
                }),
            )
            .catch((e: Error) => Promise.reject(new BadImageError(e.message)));
    }
}
