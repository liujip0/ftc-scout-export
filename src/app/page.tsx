"use client";

import Image from "next/image";

const buildCSV = () => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const queries_arr = [];

  let skip = 0;
  const take = 50;

  while (skip + take < 6000) {
    const graphql = JSON.stringify({
      query: `{\r\n  tepRecords(season:2024, skip:${skip}, take:${take}, region:All, ) {\r\n    data {\r\n      noFilterRank\r\n      data {\r\n        teamNumber\r\n        stats { \r\n            ... on TeamEventStats2024 {\r\n            opr { totalPoints, totalPointsNp }}\r\n        }\r\n      }\r\n    }\r\n  }\r\n}\r\n`,
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
          let obj = JSON.parse(result);
        })
    );
  }
};

const downloadBlob = (fileBlob: Blob) => {
  const element = document.createElement("a");

  element.href = URL.createObjectURL(fileBlob);

  element.download = `data.csv`;

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

            downloadBlob(new Blob([]));
          }}
          className="text-black  bg-white p-4"
        >
          Download full rankings
        </button>
      </main>
    </div>
  );
}
