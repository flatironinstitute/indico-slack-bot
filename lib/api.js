import moment from 'moment';
import axios from 'axios';
import { logError } from '../bin/utils';

/**
 * Queries Indico API for event info by date.
 * @param {string} day Date in ISO format.
 * @return {object} res Event info for specified date.
 */
async function queryIndicoByDate(day) {
  const formattedDay = moment(day).format('YYYY-MM-DD');

  const queryUrl = `https://indico.flatironinstitute.org/export/categ/0.json?apikey=${process.env.INDICO_KEY}&from=${formattedDay}&to=${formattedDay}&pretty=yes`;
  const res = await axios.get(queryUrl).catch((e) => logError(e));
  return res.data;
}

export default { queryIndicoByDate };
