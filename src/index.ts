import { parse } from 'csv-parse';
import { createReadStream } from 'fs';

const results: any = [];

createReadStream('data/kepler_planets.csv')
    .pipe(parse({
        comment: '#',
        columns: true
    }))
    .on('data', (data) => {
        results.push(data);
    })
    .on('error', (err) => {
        console.error(err);
    })
    .on('end', () => {
        console.log(results);
        console.log('File read done');
    });