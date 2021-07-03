import { RowDataPacket } from "mysql2/promise";

export namespace SQLResultConverter {
  export function mapToDataArray<T>(
    rawData: RowDataPacket[],
    typeConstructor: Constructor<T>
  ): T[] {
    return mapSQLResponseToDataArray<T>(
      rawData,
      typeConstructor,
      addStandardDatumToArray
    );
  }

  export function mapJSONToDataArray<T>(
    rawData: RowDataPacket[],
    typeConstructor: Constructor<T>
  ): T[] {
    return mapSQLResponseToDataArray<T>(
      rawData,
      typeConstructor,
      addJSONDatumToArray
    );
  }
}

function mapSQLResponseToDataArray<T>(
  rawData: RowDataPacket[],
  typeConstructor: Constructor<T>,
  datumCreator: <T>(datum: any, type: Constructor<T>) => T
): T[] {
  return rawData
    .map((datum: unknown) => {
      return datumCreator(datum, typeConstructor);
    })
    .filter((datum) => datum !== undefined);
}

function addStandardDatumToArray<T>(datum: any, type: Constructor<T>) {
  return constructInstance<T>(datum, type);
}

function addJSONDatumToArray<T>(datum: any, type: Constructor<T>) {
  return constructInstance<T>(datum.data, type);
}

type Constructor<T extends {} = {}> = new (...args: any[]) => T;

const constructInstance = <T>(
  source: any,
  destinationConstructor: Constructor<T>
): T => Object.assign(new destinationConstructor(), source);
