import {
  compose,
  defaultTo,
  head,
  isNil,
  join,
  juxt,
  tail,
  toUpper,
} from "ramda";

export const capitalizeFirstLetter = compose(
  join(""),
  juxt([compose(toUpper, head), tail]),
) as unknown as (phrase: string) => string;

export const defaultString = (value?: string | null, replacer?: string) =>
  defaultTo(defaultTo("", replacer), value);

export const compareObjects = <T extends object>(t1: T, t2: T) =>
  JSON.stringify(t1) === JSON.stringify(t2);

type UppercaseFirstChar<T extends string> =
  T extends `${infer First}${infer Rest}` ? `${Uppercase<First>}${Rest}` : T;

export function toUpperFirst<T extends string>(word: T): UppercaseFirstChar<T> {
  return (word.charAt(0).toUpperCase() +
    word.slice(1)) as UppercaseFirstChar<T>;
}

export const defaultZero = (value?: number | null) => defaultTo(0, value);

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clearAfterMs(cb: (v: string) => void, v: string, ms = 1500) {
  cb(v);
  setTimeout(() => {
    cb("");
  }, ms);
}

export function unwrapInto<T>(object: T, v: { [key: string]: unknown }) {
  return { ...object, ...v };
}

export const transformSecondsToTime = (sec: number) => {
  const minutes = Math.floor(sec / 60);
  const seconds = sec - minutes * 60;

  return minutes + ":" + (Number(seconds) < 10 ? "0" : "") + seconds;
};

export function compareDotStrings(version1: string, version2: string) {
  const v1 = version1.split(".");
  const v2 = version2.split(".");

  const maxLength = Math.max(v1.length, v2.length);

  for (let i = 0; i < maxLength; i++) {
    const num1 = parseInt(v1[i], 10) || 0;
    const num2 = parseInt(v2[i], 10) || 0;

    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }

  return 0;
}

export function arrayToDictionary<T>(
  arr: Array<T>,
  k: keyof T,
): { [key: string]: T } {
  const result: { [key: string]: T } = {};
  for (const i of arr) {
    const keyOfObject = i[k];
    result[keyOfObject as string] = i;
  }

  return result;
}

export function fulfilledOr<T>(data: PromiseSettledResult<T>, or: T) {
  return data.status === "fulfilled" ? data.value : or;
}

export const valueOrOther = (key: string, def: string) => (props: object) =>
  defaultTo(def, (<never>props)[key]);

export const valueOrZero =
  (key: string, def = 0) =>
  (props: object) =>
    defaultTo(def, (<never>props)[key]);

export function getId(data: string | undefined) {
  if (isNil(data)) return "";
  if (data.length <= 1) return data;
  const splitStr = data.split("/");
  return splitStr[splitStr.length - 1];
}

export const getByCurrency = (currency: number | string) => +currency;
export const setByCurrency = (currency: number | string) => +currency;

export const isPrimitive = <T>(data: T) =>
  ["string", "boolean", "number", "symbol", "undefined", "null"].includes(
    typeof data,
  );

export const nullify = <T>(nullifyArg: T, ...functions: ((v: T) => void)[]) => {
  functions?.forEach((func) => {
    func?.(JSON.parse(JSON.stringify(nullifyArg)));
  });
};



export function getDates(dates: string[]) {
  let result = "";
  dates.forEach((date, index) => {
    const dateFormat =  new Date(date).toISOString().slice(0, 10);
    if (index === 0) {
      result += `?dates=${dateFormat}`
    } else {
      result += `&dates=${dateFormat}`
    }
  })

  return result;
}
