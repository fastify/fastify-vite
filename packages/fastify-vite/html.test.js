import { readFile } from 'node:fs/promises';
import { describe, expect, test } from 'vitest'
import { createHtmlTemplateFunction } from './html.js';

describe('createHtmlTemplateFunction', () => {
	test('replaces comments without spaces <!-- element -->', async () => {
		const templateFn = createHtmlTemplateFunction([
			'<!doctype html>',
			'<!-- element -->',
			'<script type="module" src="./mount.js"></script>',
		].join('\n'));
		const resultStream = templateFn({ element: 'walalalala' });
		const resultStr = await streamToString(resultStream);

		expect(resultStr).toBe([
			'<!doctype html>',
			'walalalala',
			'<script type="module" src="./mount.js"></script>',
		].join('\n'));
	});

	test('leaves comments with spaces alone', async () => {
		const templateFn = createHtmlTemplateFunction([
			'<!-- arbitrary comment -->',
			'<!doctype html>',
			'<!-- detailed explanation here -->',
			'<script type="module" src="./mount.js"></script>',
			'<!-- secret easter egg note -->',
		].join('\n'));
		const resultStream = templateFn({ element: '' });
		const resultStr = await streamToString(resultStream);

		expect(resultStr).toBe([
			'<!-- arbitrary comment -->',
			'<!doctype html>',
			'<!-- detailed explanation here -->',
			'<script type="module" src="./mount.js"></script>',
			'<!-- secret easter egg note -->',
		].join('\n'));
	});

	function streamToString(stream) {
		const chunks = [];
		return new Promise((resolve, reject) => {
			stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
			stream.on('error', (err) => reject(err));
			stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
		})
	}
});
