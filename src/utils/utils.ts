import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import testData from '#data/qa.data.json';

dotenv.config({path: path.resolve('.', '.env')});

const tdPath = `data/${process.env.ENV | 'qa'}.data.json`

export const getTestData: any = async () => {
    const resData = await JSON.parse(fs.readFileSync(tdPath, 'utf-8'));
    // console.log('Test Data - ' + JSON.stringify(resData.dataSet));
    return resData;
};

export const getTestDataNode: any = async(dataId: string, node: string) => {
    const resData = await getTestData();
    return resData.dataSet.find((dt:any) => dt.dataId === dataId).data[node];
};