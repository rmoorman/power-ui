/**
 * This file is part of power-ui, originally developed by Futurice Oy.
 *
 * power-ui is licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
/** @jsx hJSX */
import {hJSX} from '@cycle/dom';
import moment from 'moment';
import {safeCoerceToString} from 'power-ui/utils';
import styles from './styles.scss';

function view(state$) {
  // Debounce(1) to avoid multiple synchronous updates
  return state$.debounce(1).map(({length, selected}) => {
    const momentLabel = moment().add(selected, 'months').format('YYYY - MMM');
    const monthSelectorClassName = safeCoerceToString(styles.monthSelector);
    const arrowLeftClassName = safeCoerceToString(selected > 0
      ? styles.arrowLeft
      : styles.arrowLeftDisabled
    );
    const arrowRightClassName = safeCoerceToString(selected < length - 1
      ? styles.arrowRight
      : styles.arrowRightDisabled
    );
    return (
      <div className={`MonthSelector ${monthSelectorClassName}`.trim()}>
        <img
          className={`left ${arrowLeftClassName}`.trim()}
          src="img/arrow_icon.svg" />
        <span>{momentLabel}</span>
        <img
          className={`right ${arrowRightClassName}`.trim()}
          src="img/arrow_icon.svg" />
      </div>
    );
  });
}

export default view;
