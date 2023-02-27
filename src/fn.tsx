import {CCCurrencySetting, CompanyCurrencySetting} from './App'

type AbbreviationType = 'K' | 'M' | 'B';

export const renderCurrencyAmount = (
  inputAmount: number,
  inputCurrencyCode?: string,
  inputCurrecySetting?: CompanyCurrencySetting,
  overrideSetting?: CCCurrencySetting,
): string => {
  if (!inputCurrecySetting || !overrideSetting) {
    return '';
  }

  // if negative, we rm '-' temporary, insert back on every return
  let amount = inputAmount;
  let isPositive = true;
  if (amount < 0) {
    amount = -amount;
    isPositive = false;
  }

  const currencyCode = inputCurrencyCode || 'MYR';

  // settings
  const {
    isAbbreviationEnabled: isAbbrvEnabled,
    abbreviationDecimalPoints,
    displayDecimal: isDecimalsIncluded,
    decimalSeparator,
    thousandsSeparator,
    millionsSeparator,
    billionsSeparator,
  } = inputCurrecySetting;

  const abbrvDPs = abbreviationDecimalPoints ?? 2;
  const ds = decimalSeparator ?? '.';
  const ts = thousandsSeparator ?? ',';
  const ms = millionsSeparator ?? ',';
  const bs = billionsSeparator ?? ',';

  const {
    isShowFullDigits = false,
    isRoundingUp = false,
    isAlwaysMinAbbreviation = false,
    isShowCurrencyCode = false,
  } = overrideSetting;

  // get splitIntegers & splitDecimals
  const getOriIntegerDecimal = (_amount: number): { splitInts: string[]; splitDecs: string[] } => {
    const splitAmount = _amount.toString().split('.');
    const splitInts = splitAmount[0].split('') || Array(1).fill('0');
    const splitDecs = splitAmount?.[1]?.split('') || Array(2).fill('0');

    // fill in zero for single decimal.
    if (splitDecs.length === 1) {
      splitDecs.splice(1, 0, '0');
    }
    return { splitInts, splitDecs };
  };

  // unmutable GET
  const { splitInts, splitDecs } = getOriIntegerDecimal(amount);
  const restoreSplitIntegers = () => splitInts;
  const restoreSplitDecimals = () => splitDecs;

  // mutable, to restore original intergers and decimals
  // reassign with value of splitInts & splitDecs
  let splitIntegers = restoreSplitIntegers();
  let splitDecimals = restoreSplitDecimals();
  // mutable but not to overwrite > 1 under each return flow.
  let resultIntegers = '';
  let resultDecimals = '';
  let resultNumbers = '';

  // flow
  if (isShowFullDigits) {
    // ignore isRoundingUp
    // ignore isAbbreviationEnabled
    // ignore isDisplayDecimal
    switch (true) {
      // in thousand separator range
      case splitIntegers.length > 3 && splitIntegers.length <= 6:
        splitIntegers.splice(-3, 0, ts);
        break;
      // in million separator range
      case splitIntegers.length > 6 && splitIntegers.length <= 9:
        splitIntegers.splice(-3, 0, ts);
        splitIntegers.splice(-7, 0, ms);
        break;
      // in billion separator range
      case splitIntegers.length > 9:
        splitIntegers.splice(-3, 0, ts);
        splitIntegers.splice(-7, 0, ms);
        splitIntegers.splice(-11, 0, bs);
        break;
      default:
        break;
    }

    resultIntegers = splitIntegers.join('');
    resultDecimals = splitDecimals.join('');
    resultNumbers = isPositive
      ? `${resultIntegers}${ds}${resultDecimals}`
      : `-${resultIntegers}${ds}${resultDecimals}`;

    return isShowCurrencyCode
      ? `${currencyCode} ${resultNumbers}`
      : `${resultNumbers}`;
  }

  if (isAbbrvEnabled) {
    // ignore isDisplayDecimal

    // which abrev, chop count, abbrev decimal count, abbrev separator
    let abbrev: AbbreviationType | '';
    let chopCount: number;
    let abbrevDecimalCount: number;
    let abbrevSeparator: string;

    switch (true) {
      // not in any abbrev range
      case splitIntegers.length <= 3:
        // ignore abbreviationDecimalPoints
        abbrev = isAlwaysMinAbbreviation ? 'K' : '';
        chopCount = isAlwaysMinAbbreviation ? 3 : 0;
        chopCount = splitIntegers.length - chopCount < 0
          ? splitIntegers.length
          : chopCount;
        abbrevDecimalCount = isAlwaysMinAbbreviation ? 3 : 0;
        abbrevDecimalCount = splitIntegers.length < abbrevDecimalCount
          ? splitIntegers.length
          : abbrevDecimalCount;
        abbrevSeparator = isAlwaysMinAbbreviation ? '.' : '';
        abbrevSeparator = splitIntegers.length <= 2 && isAlwaysMinAbbreviation
          ? `${abbrevSeparator}${[...Array(3 - splitIntegers.length).fill('0')].join('')}`
          : abbrevSeparator;
        break;
      // in thousand abbrev range
      case splitIntegers.length > 3 && splitIntegers.length <= 6:
        abbrev = 'K';
        chopCount = 3;
        abbrevDecimalCount = abbrvDPs;
        abbrevSeparator = '.';
        break;
      // in million abbrev range
      case splitIntegers.length > 6 && splitIntegers.length <= 9:
        abbrev = 'M';
        chopCount = 6;
        abbrevDecimalCount = abbrvDPs;
        abbrevSeparator = '.';
        break;
      // in billion abbrev range
      case splitIntegers.length > 9:
        abbrev = 'B';
        chopCount = 9;
        abbrevDecimalCount = abbrvDPs;
        abbrevSeparator = '.';
        break;
      default:
        abbrev = '';
        chopCount = 0;
        abbrevDecimalCount = 0;
        abbrevSeparator = '';
        break;
    }

    if (isRoundingUp) {
      switch (true) {
        case splitIntegers.length <= 3:
          chopCount = isAlwaysMinAbbreviation ? 3 : 0;
          abbrevDecimalCount = isAlwaysMinAbbreviation ? 3 : 0;
          break;
        case splitIntegers.length > 3 && splitIntegers.length <= 6:
          chopCount = 3;
          abbrevDecimalCount = chopCount <= abbrevDecimalCount ? chopCount : abbrevDecimalCount;
          break;
        case splitIntegers.length > 6 && splitIntegers.length <= 9:
          chopCount = 6;
          abbrevDecimalCount = chopCount <= abbrevDecimalCount ? chopCount : abbrevDecimalCount;
          break;
        case splitIntegers.length > 9:
          chopCount = 9;
          abbrevDecimalCount = chopCount <= abbrevDecimalCount ? chopCount : abbrevDecimalCount;
          break;
        default:
          chopCount = 0;
          abbrevDecimalCount = 0;
          break;
      }

      let amt = (Math.round((inputAmount / (10 ** chopCount)) * (10 ** abbrevDecimalCount)) / (10 ** abbrevDecimalCount)).toFixed(abbrevDecimalCount);
      if (inputAmount > 0 && Number(amt) === 0) {
        amt = (Math.ceil((inputAmount / (10 ** chopCount)) * (10 ** abbrevDecimalCount)) / (10 ** abbrevDecimalCount)).toFixed(abbrevDecimalCount);
      }
      resultNumbers = amt;
      return isShowCurrencyCode
        ? `${currencyCode} ${resultNumbers}${abbrev}`
        : `${resultNumbers}${abbrev}`;
    }

    // abbrevIntegers, abbrevDecimals
    let abbrevIntegers: string[] = [];
    let abbrevDecimals: string[] = [];

    splitIntegers = restoreSplitIntegers();
    abbrevIntegers = splitIntegers.splice(0, splitIntegers.length - chopCount);
    splitIntegers = restoreSplitIntegers();
    abbrevDecimals = splitIntegers.splice(-chopCount, abbrevDecimalCount);

    resultIntegers = `${abbrevIntegers.join('') || '0'}${abbrevSeparator}${abbrevDecimals.join('')}`;
    splitDecimals = restoreSplitDecimals();
    resultDecimals = splitDecimals.join('');

    resultNumbers = isPositive
      ? `${resultIntegers}${abbrev || (ds + resultDecimals)}`
      : `-${resultIntegers}${abbrev || (ds + resultDecimals)}`;

    return isShowCurrencyCode
      ? `${currencyCode} ${resultNumbers}`
      : `${resultNumbers}`;
  }

  switch (true) {
    // in thousand separator range
    case splitIntegers.length > 3 && splitIntegers.length <= 6:
      splitIntegers.splice(-3, 0, ts);
      break;
    // in million separator range
    case splitIntegers.length > 6 && splitIntegers.length <= 9:
      splitIntegers.splice(-3, 0, ts);
      splitIntegers.splice(-7, 0, ms);
      break;
    // in billion separator range
    case splitIntegers.length > 9:
      splitIntegers.splice(-3, 0, ts);
      splitIntegers.splice(-7, 0, ms);
      splitIntegers.splice(-11, 0, bs);
      break;
    default:
      break;
  }

  if (!isDecimalsIncluded) {
    // ignore abbreviationDecimalPoints

    // if (isRoundingUp) {
    //   let amt = (Math.round((inputAmount / (10 ** chopCount)) * (10 ** chopCount)) / (10 ** chopCount)).toFixed(chopCount);
    //   if (inputAmount > 0 && Number(amt) === 0) {
    //     amt = (Math.ceil((inputAmount / (10 ** chopCount)) * (10 ** chopCount)) / (10 ** chopCount)).toFixed(chopCount);
    //   }
    //   resultNumbers = amt;
    //   return isShowCurrencyCode
    //     ? `${currencyCode} ${resultNumbers}`
    //     : `${resultNumbers}`;
    // }

    resultIntegers = splitIntegers.join('');
    resultNumbers = isPositive
      ? `${resultIntegers}`
      : `-${resultIntegers}`;

    return isShowCurrencyCode
      ? `${currencyCode} ${resultNumbers}`
      : `${resultNumbers}`;
  }
  // ignore abbreviationDecimalPoints
  // ignore isRoundingUp
  resultIntegers = splitIntegers.join('');
  resultDecimals = splitDecimals.join('');
  resultNumbers = isPositive
    ? `${resultIntegers}${ds}${resultDecimals}`
    : `-${resultIntegers}${ds}${resultDecimals}`;

  return isShowCurrencyCode
    ? `${currencyCode} ${resultNumbers}`
    : `${resultNumbers}`;
};
