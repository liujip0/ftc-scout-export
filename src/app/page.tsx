'use client';

import { useState } from 'react';
import { Button, Label, ProgressBar } from 'react-aria-components';

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
        dcParkPoints: number;
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

const buildCSV = (
  setStatus: (value: string) => void,
  setProgress: (value: number) => void
) => {
  setStatus('loading');
  setProgress(0);

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');

  const queries_arr = [];

  let skip = 0;
  const take = 50;

  while (skip + take < 6000) {
    setProgress((skip / 6000) * 100);
    const graphql = JSON.stringify({
      query: `{\r\n  tepRecords(season:2024, skip:${skip}, take:${take}, region:All, ) {\r\n    data {\r\n      noFilterRank\r\n      data {\r\n        teamNumber\r\n        stats { \r\n            ... on TeamEventStats2024 {\r\n            opr { totalPoints, totalPointsNp, autoPoints, dcPoints, dcParkPoints }}\r\n        }\r\n      }\r\n    }\r\n  }\r\n}\r\n`,
      variables: {}
    });
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: graphql
    };

    queries_arr.push(
      fetch('https://api.ftcscout.org/graphql', requestOptions)
        .then((response) => response.text())
        .then((result) => {
          let obj: TepRecordsResponse = JSON.parse(result);

          let { data } = obj.data.tepRecords;

          console.dir({ data });

          return data.map(
            ({
              data: {
                teamNumber,
                stats: { opr }
              }
            }) =>
              `${teamNumber}, \
${opr.totalPoints.toFixed(2)}, \
${opr.totalPointsNp.toFixed(2)}, \
${opr.autoPoints.toFixed(2)}, \
${opr.dcPoints.toFixed(2)}, \
${opr.dcParkPoints.toFixed(2)}`
          );
        })
    );

    skip += take;
  }

  Promise.all(queries_arr).then(
    (data) => {
      setTimeout(() => {
        setStatus('');
        setProgress(0);
      }, 500);

      let csv =
        'teamnumber, opr, nopr, auto, teleop, endgame \n' +
        data.flat().join('\n');

      downloadBlob(new Blob([csv], { type: 'text/csv' }));
    },
    (error) => {
      console.log(error);
      setStatus('Error: ' + error);
    }
  );
};

const downloadBlob = (fileBlob: Blob) => {
  const element = document.createElement('a');

  element.href = URL.createObjectURL(fileBlob);

  let now = new Date();

  element.download = `ftc-export-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}@${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.csv`;

  document.body.appendChild(element); // Required for this to work on FireFox

  element.click();

  element.remove();
};

export default function Home() {
  const [status, setStatus] = useState('loading');
  const [progress, setProgress] = useState(0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_max-content] min-w-screen min-h-screen">
      <div className="bg-white"></div>
      <main className="flex flex-col items-center justify-center p-12 bg-black">
        {status === '' ? (
          <DownloadButton
            status={status}
            setStatus={setStatus}
            setProgress={setProgress}
          />
        ) : status === 'loading' ? (
          <div>
            <ProgressBar value={progress}>
              {({ percentage, valueText }) => (
                <>
                  <Label>Downloading...</Label>
                  <span className="value">{valueText}</span>
                  <div className="bar">
                    <div
                      className="fill"
                      style={{ width: `${percentage}%` }}></div>
                  </div>
                </>
              )}
            </ProgressBar>
            {
              //TODO: loading bar
            }
          </div>
        ) : (
          <>
            <DownloadButton
              status={status}
              setStatus={setStatus}
              setProgress={setProgress}
            />
            <p className="text-red-500">{status}</p>
          </>
        )}
      </main>
    </div>
  );
}

type DownloadButtonProps = {
  status: string;
  setStatus: (value: string) => void;
  setProgress: (value: number) => void;
};
function DownloadButton({
  status,
  setStatus,
  setProgress
}: DownloadButtonProps) {
  return (
    <Button
      onPress={() => {
        if (!status) {
          buildCSV(setStatus, setProgress);
        }
      }}
      className="text-black bg-white p-4">
      Download full rankings
    </Button>
  );
}
