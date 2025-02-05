/**
 * APITable <https://github.com/apitable/apitable>
 * Copyright (C) 2022 APITable Ltd. <https://apitable.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { DatasheetActions } from 'commands_actions/datasheet';
import Joi from 'joi';
import { Field } from 'model/field/field';
import { ICellToStringOption, ICellValue } from 'model/record';
import { Strings, t } from 'exports/i18n';
import { IReduxState } from 'exports/store';
import {
  APIMetaButtonActionType,
  BasicOpenValueType,
  BasicValueType,
  ButtonActionType,
  ButtonStyleType,
  CollectType,
  FieldType,
  FOperator,
  IAPIMetaButtonFieldProperty, IButtonField, IButtonProperty, IField,
  IFilterCondition,
  IStandardValue,
  OpenLinkType,
} from 'types';
import { joiErrorResult, datasheetIdString } from './validate_schema';
import { pick } from 'lodash';

export const AutomationConstant = {
  DEFAULT_TEXT : t(Strings.click_start),
  defaultColor : 50,
};

export class ButtonField extends Field {
  constructor(
    public override field: IButtonField,
    public override state: IReduxState,
  ) {
    super(field, state);
  }

  static propertySchema = Joi.object({
    datasheetId: datasheetIdString().required(),
    text: Joi.string().required(),
    style: Joi.object({
      type: Joi.number().valid(ButtonStyleType.Background, ButtonStyleType.OnlyText),
      color: Joi.number().integer().min(0).required(),
    }).required(),
    action: Joi.object({
      type: Joi.number().valid(ButtonActionType.OpenLink, ButtonActionType.TriggerAutomation),
      openLink: Joi.object({
        type: Joi.number().valid(OpenLinkType.Url, OpenLinkType.Expression),
        expression: Joi.string().when('type', { is: ButtonActionType.OpenLink, then: Joi.string().allow('').required() }),
      }),
      automation: Joi.object({
        automationId: Joi.string().when('type', {
          is: ButtonActionType.TriggerAutomation,
          then: Joi.string()
            .pattern(/^aut.+/, 'automationId')
            .required(),
        }),
        triggerId: Joi.string().pattern(/^atr.+/, 'triggerId'),
      }),
    }).required(),
  }).required();

  override get apiMetaProperty(): IAPIMetaButtonFieldProperty {
    return {
      action: {
        ...this.field.property.action,
        type:
          this.field.property.action.type == ButtonActionType.TriggerAutomation
            ? APIMetaButtonActionType.TriggerAutomation
            : APIMetaButtonActionType.OpenLink,
      },
    };
  }
  override get canGroup(): boolean {
    return false;
  }

  override get canFilter(): boolean {
    return false;
  }

  get openValueJsonSchema() {
    return {
      type: 'string',
      title: this.field.name,
    };
  }

  static defaultProperty(): IButtonProperty {
    return {
      datasheetId: '',
      text: t(Strings.button_text_click_start),
      style: {
        type: ButtonStyleType.Background,
        color: 50,
      },
      action: {
      },
    };
  }

  static createDefault(fieldMap: { [fieldId: string]: IField }): IButtonField {
    return {
      id: DatasheetActions.getNewFieldId(fieldMap),
      type: FieldType.Button,
      name: DatasheetActions.getDefaultFieldName(fieldMap),
      property: this.defaultProperty(),
    };
  }

  override get isComputed() {
    return true;
  }

  override get basicValueType(): BasicValueType {
    return BasicValueType.Array;
  }

  override recordEditable() {
    return false;
  }

  override stdValueToCellValue(): null {
    return null;
  }

  override validate(_cv: ICellValue) {
    return true;
  }

  validateProperty() {
    const newProperty = pick(this.field.property,
      'datasheetId',
      'text',
      'style',
      'action',
    );
    return ButtonField.propertySchema.validate(newProperty);
  }

  validateCellValue() {
    return joiErrorResult("computed field shouldn't validate cellValue");
  }

  validateOpenWriteValue() {
    return joiErrorResult("computed field shouldn't validate cellValue");
  }

  static openUpdatePropertySchema = Joi.object({
    collectType: Joi.number().valid(CollectType.AllFields, CollectType.SpecifiedFields),
    fieldIdCollection: Joi.array().items(Joi.string()),
  }).required();

  public get acceptFilterOperators(): FOperator[] {
    return [];
  }

  public cellValueToApiStandardValue(_cellValue: ICellValue): any {
    return null;
  }

  public cellValueToApiStringValue(_cellValue: ICellValue): string | null {
    return null;
  }

  public cellValueToOpenValue(_cellValue: ICellValue): BasicOpenValueType | null {
    return null;
  }

  public cellValueToStdValue(_ellValue: ICellValue | null): IStandardValue {
    return {
      sourceType: FieldType.Button,
      data: [],
    };
  }

  public cellValueToString(_cellValue: ICellValue, _cellToStringOption?: ICellToStringOption): string | null {

    return this.field.property.text;
  }

  public defaultValueForCondition(_condition: IFilterCondition): ICellValue {
    return null;
  }

  public openWriteValueToCellValue(_openWriteValue: any): ICellValue {
    return null;
  }
}
