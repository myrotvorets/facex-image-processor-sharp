import { createReadStream } from 'fs';
import { BadImageError } from '@myrotvorets/facex-base';
import { ImageProcessorSharp } from '../../lib';

const mockMetadata = jest.fn();
const mockJpeg = jest.fn();
const mockToBuffer = jest.fn();

jest.mock('sharp', () => {
    return jest.fn().mockImplementation(() => ({
        metadata: mockMetadata,
        jpeg: mockJpeg,
        toBuffer: mockToBuffer,
    }));
});

describe('ImageProcessorSharp', () => {
    const processor = new ImageProcessorSharp();

    it('should throw BadImageError if the image is bad', () => {
        mockMetadata.mockRejectedValueOnce(new Error('error'));

        const stream = createReadStream(__filename);
        stream.pipe = jest.fn();
        return expect(processor.process(stream)).rejects.toThrow(BadImageError);
    });

    it('should not change good images', () => {
        mockMetadata.mockResolvedValueOnce({
            format: 'jpeg',
            isProgressive: false,
            chromaSubsampling: '4:2:0',
        });

        mockToBuffer.mockResolvedValueOnce(Buffer.from(''));

        const stream = createReadStream(__filename);
        stream.pipe = jest.fn();
        return expect(processor.process(stream))
            .resolves.toBe('')
            .then(() => {
                expect(mockJpeg).not.toHaveBeenCalled();
                expect(mockToBuffer).toHaveBeenCalled();
                return true;
            });
    });

    it('should convert bad images', () => {
        mockMetadata.mockResolvedValueOnce({
            format: 'png',
            isProgressive: true,
        });

        mockToBuffer.mockResolvedValueOnce(Buffer.from(''));

        const stream = createReadStream(__filename);
        stream.pipe = jest.fn();
        return expect(processor.process(stream))
            .resolves.toBe('')
            .then(() => {
                expect(mockJpeg).toHaveBeenCalledWith({ progressive: false, chromaSubsampling: '4:2:0' });
                expect(mockToBuffer).toHaveBeenCalled();
                return true;
            });
    });
});
