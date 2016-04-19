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
import * as Rx from 'rx';
import {div} from '@cycle/dom';
import renderNavBar from 'power-ui/components/widgets/NavBar/index';
import 'power-ui/styles/global.scss';

function selectPage(route, peopleVTree, projectsVTree, powerheadVTree) {
  switch (route) {
  case '/powerhead': return powerheadVTree;
  case '/projects': return projectsVTree;
  default:
  case '/people': return peopleVTree;
  }
}

function view(route$, peopleVTree$, projectsVTree$, powerheadVTree$) {
  return Rx.Observable.combineLatest(
    route$, peopleVTree$, projectsVTree$, powerheadVTree$,
    (route, peopleVTree, projectsVTree, powerheadVTree) =>
      div([
        renderNavBar(route),
        selectPage(route, peopleVTree, projectsVTree, powerheadVTree),
      ])
  );
}

export default view;
