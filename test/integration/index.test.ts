import { createReadStream } from 'fs';
import { join } from 'path';
import { BadImageError } from '@myrotvorets/facex-base';
import { ImageProcessorSharp } from '../../lib';

describe('ImageProcessorSharp', () => {
    const processor = new ImageProcessorSharp();

    it('should throw BadImageError if the image is bad', () => {
        const stream = createReadStream(join(__dirname, 'bad-image.jpeg'));
        return expect(processor.process(stream)).rejects.toThrow(BadImageError);
    });

    it('should not change good images', () => {
        const expected =
            '/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJUAB//Z';
        const stream = createReadStream(join(__dirname, '1x1.jpeg'));
        return expect(processor.process(stream)).resolves.toBe(expected);
    });

    it('should convert bad images', () => {
        const expected =
            '/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJUAB//Z';
        const stream = createReadStream(join(__dirname, '1x1.png'));
        return expect(processor.process(stream)).resolves.toBe(expected);
    });
});
