import dayjs from 'dayjs';
import axios from 'axios';
import { logError } from './utils';

/**
 * Queries Indico API for event info by date.
 * @param {string} day Date in ISO format.
 * @return {object}  Event info for specified date.
 */
export default async function queryIndicoByDate(day) {
  const formattedDay = dayjs(day).format('YYYY-MM-DD');
  const queryUrl = `https://indico.flatironinstitute.org/export/categ/0.json?apikey=${process.env.INDICO_KEY}&from=${formattedDay}&to=${formattedDay}&pretty=yes`;

  const res = await axios.get(queryUrl).catch((e) => logError(e));

  if (res.status === 200) {
    // eslint-disable-next-line no-console
    console.log(`🗳️  Indico query success for ${formattedDay}.`);
  }
  const data = res.data || {};
  return data;
}
