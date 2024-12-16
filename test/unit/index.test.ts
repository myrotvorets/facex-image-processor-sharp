import { Mock, afterEach, describe, it, mock } from 'node:test';
import { deepEqual, equal, rejects } from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import { BadImageError } from '@myrotvorets/facex-base';
import type { Metadata, Sharp } from 'sharp';

void describe('ImageProcessorSharp', async () => {
    const mockMetadata: Mock<() => Promise<Metadata>> = mock.fn<Sharp['metadata']>();
    const mockJpeg = mock.fn<Sharp['jpeg']>();
    const mockToBuffer: Mock<() => Promise<Buffer>> = mock.fn<Sharp['toBuffer']>();
    const mockRotate = mock.fn();

    mock.module('sharp', {
        defaultExport: () => ({
            metadata: mockMetadata,
            jpeg: mockJpeg,
            rotate: mockRotate,
            toBuffer: mockToBuffer,
        }),
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ImageProcessorSharp } = require('../../lib') as typeof import('../../lib');
    const processor = new ImageProcessorSharp();

    afterEach(() => {
        mock.reset();
        mockMetadata.mock.resetCalls();
        mockJpeg.mock.resetCalls();
        mockToBuffer.mock.resetCalls();
        mockRotate.mock.resetCalls();
    });

    await it('should throw BadImageError if the image is bad', async () => {
        mockMetadata.mock.mockImplementationOnce(() => {
            throw new Error('error');
        });

        const stream = createReadStream(__filename);
        stream.pipe = mock.fn();
        await rejects(processor.process(stream), BadImageError);
    });

    await it('should not change good images', async () => {
        mockMetadata.mock.mockImplementationOnce(() =>
            Promise.resolve({
                format: 'jpeg',
                isProgressive: false,
                chromaSubsampling: '4:2:0',
            }),
        );

        mockToBuffer.mock.mockImplementationOnce(() => Promise.resolve(Buffer.from('')));

        const stream = createReadStream(__filename);
        stream.pipe = mock.fn();

        const expected = '';
        const actual = await processor.process(stream);
        equal(actual, expected);

        equal(mockRotate.mock.callCount(), 1);
        equal(mockJpeg.mock.callCount(), 0);
        equal(mockToBuffer.mock.callCount(), 1);
    });

    await it('should convert bad images', async () => {
        mockMetadata.mock.mockImplementationOnce(() =>
            Promise.resolve({
                format: 'png',
                isProgressive: true,
            }),
        );

        mockToBuffer.mock.mockImplementationOnce(() => Promise.resolve(Buffer.from('')));

        const stream = createReadStream(__filename);
        stream.pipe = mock.fn();

        const expected = '';
        const actual = await processor.process(stream);
        equal(actual, expected);

        equal(mockRotate.mock.callCount(), 1);
        equal(mockJpeg.mock.callCount(), 1);
        deepEqual(mockJpeg.mock.calls[0].arguments[0], { progressive: false, chromaSubsampling: '4:2:0' });
        equal(mockToBuffer.mock.callCount(), 1);
    });
});
