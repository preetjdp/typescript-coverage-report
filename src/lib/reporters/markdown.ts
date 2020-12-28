// import Table from "terminal-table";
import Table from "markdown-table"
import { CoverageData } from "../getCoverage";
import "colors";

const coverageTableArray: Array<Array<string>> = [];

const calculatePercantage = (correct: number, total: number): number => {
    if (total === 0) {
        return 100;
    }

    return (correct * 100) / total;
};

const calculatePercantageWithString = (
    correct: number,
    total: number
): string => {
    return `${calculatePercantage(correct, total).toFixed(2)}%`;
};

export const generate = (
    { fileCounts, percentage, total, covered, uncovered }: CoverageData,
    threshold: number
): string => {
    let row = 1;
    const headers = [
        "filenames" + ` (${fileCounts.size})`.gray,
        "percent" + ` (${percentage.toFixed(2)}%)`.gray,
        "total" + ` (${total})`.gray,
        "covered" + ` (${covered})`.gray,
        "uncovered" + ` (${uncovered})`.gray
    ];

    coverageTableArray.push(
        headers,
        headers.map(() => "---".gray)
    );

    //   coverageTable.attrRange(
    //     { column: [1, 5] },
    //     {
    //       align: "right"
    //     }
    //   );

    fileCounts.forEach(
        (
            {
                totalCount,
                correctCount
            }: { totalCount: number; correctCount: number },
            filename: string
        ) => {
            row++;

            coverageTableArray.push([
                filename,
                calculatePercantageWithString(correctCount, totalCount),
                totalCount.toString(),
                correctCount.toString(),
                (totalCount - correctCount).toString()
            ]);

            //   coverageTableArray.attrRange(
            //     { row: [row] },
            //     {
            //       color:
            //         Math.floor(calculatePercantage(correctCount, totalCount)) >=
            //         threshold
            //           ? "green"
            //           : "red"
            //     }
            //   );
        }
    );

    return Table(coverageTableArray)
};
