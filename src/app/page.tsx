"use client";

import Image from "next/image";

type TepRecord = {
  noFilterRank: number;
  data: {
    teamNumber: number;
    stats: {
      opr: {
        totalPoints: number;
        totalPointsNp: number;
        autoPoints: number;
        dcPoints: number;
      };
    };
  };
};

type TepRecordsResponse = {
  data: {
    tepRecords: {
      data: TepRecord[];
    };
  };
};

const buildCSV = () => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const queries_arr = [];

  let skip = 0;
  const take = 50;

  while (skip + take < 6000) {
    const graphql = JSON.stringify({
      query: `{\r\n  tepRecords(season:2024, skip:${skip}, take:${take}, region:All, ) {\r\n    data {\r\n      noFilterRank\r\n      data {\r\n        teamNumber\r\n        stats { \r\n            ... on TeamEventStats2024 {\r\n            opr { totalPoints, totalPointsNp, autoPoints, dcPoints }}\r\n        }\r\n      }\r\n    }\r\n  }\r\n}\r\n`,
      variables: {},
    });
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: graphql,
    };

    queries_arr.push(
      fetch("https://api.ftcscout.org/graphql", requestOptions)
        .then((response) => response.text())
        .then((result) => {
          let obj: TepRecordsResponse = JSON.parse(result);

          let { data } = obj.data.tepRecords;

          console.dir({ data });

          return data.map(
            ({
              data: {
                teamNumber,
                stats: { opr },
              },
            }) =>
              `${teamNumber}, \
${opr.totalPoints.toFixed(2)}, \
${opr.totalPointsNp.toFixed(2)}, \
${opr.autoPoints.toFixed(2)}, \
${opr.dcPoints.toFixed(2)}`
          );
        })
    );

    skip += take;
  }

  Promise.all(queries_arr).then((data) => {
    let csv = "teamnumber, opr, nopr, auto, teleop \n" + data.flat().join("\n");

    downloadBlob(new Blob([csv], { type: "text/csv" }));
  });
};

const downloadBlob = (fileBlob: Blob) => {
  const element = document.createElement("a");

  element.href = URL.createObjectURL(fileBlob);

  let now = new Date();

  element.download = `ftc-export-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}@${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.csv`;

  document.body.appendChild(element); // Required for this to work on FireFox

  element.click();

  element.remove();
};

export default function Home() {
  return (
    <div className="grid items-center justify-items-center min-h-screen">
      <main className="">
        <button
          onClick={() => {
            buildCSV();
          }}
          className="text-black  bg-white p-4"
        >
          Download full rankings
        </button>
      </main>
    </div>
  );
}
