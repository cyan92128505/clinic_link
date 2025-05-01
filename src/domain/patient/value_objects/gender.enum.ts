import { EnumUtils } from 'src/utils/enum/enum.utils';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export const GenderUtils = new EnumUtils<Gender>(Gender);
