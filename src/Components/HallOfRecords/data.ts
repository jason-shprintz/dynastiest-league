import { ChampionRecord } from '../../types';

// Sample data - can be replaced with real data later
const hallOfRecords: ChampionRecord[] = [
  {
    year: '2025',
    champion: '🥇 jeffgottfried',
    second: '🥈 JuiceMarr',
    third: '🥉 ThatDudeStu',
  },
  {
    year: '2024',
    champion: '🥇 awco',
    second: '🥈 UzUrHead',
    third: '🥉 JuiceMarr',
  },
  {
    year: '2023',
    champion: '🥇 JuiceMarr',
    second: '🥈 mrnickelz12',
    third: '🥉 UzUrHead',
  },
  {
    year: '2022',
    champion: '🥇 dendenoodles611',
    second: '🥈 jeffgottfried',
    third: '🥉 UzUrHead',
  },
  {
    year: '2021',
    champion: '🥇 swiff22',
    second: '🥈 dendenoodles611',
    third: '🥉 ThatDudeStu',
  },
  {
    year: '2020',
    champion: '🥇 dendenoodles611',
    second: '🥈 mrnickelz12',
    third: '🥉 skiddy8',
  },
];

const medalCounts = {
  jeffgottfried: { gold: 1, silver: 1, bronze: 0 },
  JuiceMarr: { gold: 1, silver: 1, bronze: 1 },
  ThatDudeStu: { gold: 0, silver: 0, bronze: 2 },
  awco: { gold: 1, silver: 0, bronze: 0 },
  UzUrHead: { gold: 0, silver: 1, bronze: 2 },
  mrnickelz12: { gold: 0, silver: 2, bronze: 0 },
  dendenoodles611: { gold: 2, silver: 1, bronze: 0 },
  swiff22: { gold: 1, silver: 0, bronze: 0 },
  Casino10004: { gold: 0, silver: 0, bronze: 0 },
  RadLantern: { gold: 0, silver: 0, bronze: 0 },
};

export { hallOfRecords, medalCounts };
