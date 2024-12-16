import { createReadStream } from 'node:fs';
import { join } from 'node:path';
import { equal, rejects } from 'node:assert/strict';
import { BadImageError } from '@myrotvorets/facex-base';
import { describe, it } from 'node:test';
import { ImageProcessorSharp } from '../../lib';

void describe('ImageProcessorSharp', async () => {
    const processor = new ImageProcessorSharp();

    await it('should throw BadImageError if the image is bad', async () => {
        const stream = createReadStream(join(__dirname, 'bad-image.jpeg'));
        await rejects(processor.process(stream), BadImageError);
    });

    await it('should not change good images', async () => {
        const expected =
            '/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJUAB//Z';
        const stream = createReadStream(join(__dirname, '1x1.jpeg'));
        const actual = await processor.process(stream);
        equal(actual, expected);
    });

    await it('should convert bad images', async () => {
        const expected =
            '/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJUAB//Z';
        const stream = createReadStream(join(__dirname, '1x1.png'));
        const actual = await processor.process(stream);
        equal(actual, expected);
    });
});
