import { ISubjectRiskData } from "../subject/types";

export const calc정시위험도 = (
  myGrade: number,
  riskData: ISubjectRiskData,
): number => {
  if (myGrade >= (riskData.risk_10 || 0)) {
    return 10;
  } else if (myGrade >= (riskData.risk_9 || 0)) {
    return 9;
  } else if (myGrade >= (riskData.risk_8 || 0)) {
    return 8;
  } else if (myGrade >= (riskData.risk_7 || 0)) {
    return 7;
  } else if (myGrade >= (riskData.risk_6 || 0)) {
    return 6;
  } else if (myGrade >= (riskData.risk_5 || 0)) {
    return 5;
  } else if (myGrade >= (riskData.risk_4 || 0)) {
    return 4;
  } else if (myGrade >= (riskData.risk_3 || 0)) {
    return 3;
  } else if (myGrade >= (riskData.risk_2 || 0)) {
    return 2;
  } else if (myGrade >= (riskData.risk_1 || 0)) {
    return -15;
  }
  return -15;
};
