import type { ClientConn } from "@builder.io/qwik-city/middleware/request-handler";

type RequestsMap = Record<string, number[] | undefined>;
export const REQUESTS_MAP: RequestsMap = {};
const RATE_LIMIT_MAX_COUNT = 10;
const RATE_LIMIT_TIME = 1000 * 60 * 60 * 24; // 24h

export const getUserIP = (request: Request, clientConn: ClientConn) => {
  return request.headers.get("x-forwarded-for") || clientConn.ip!;
};

const getLastDigit = (value: number) => {
  const valueStr = value.toString();
  const lastDigit = valueStr.at(-1) || "0";
  return parseInt(lastDigit);
};

const getTimeLabel = (remainingTime: number, wordBase: string) => {
  if (!remainingTime) return "";

  const lastDigit = getLastDigit(remainingTime);

  return `${remainingTime} ${
    lastDigit === 1
      ? `${wordBase}ę`
      : lastDigit >= 2 && lastDigit <= 4
      ? `${wordBase}y`
      : wordBase
  }`;
};

export const calcRateLimit = (userFingerprint: string) => {
  const userReqestsWithinRateLimitTime: number[] = [];
  const userRequests = REQUESTS_MAP[userFingerprint] || [];

  for (const requestTs of userRequests) {
    if (Date.now() - requestTs < RATE_LIMIT_TIME) {
      userReqestsWithinRateLimitTime.push(requestTs);
    }
  }

  REQUESTS_MAP[userFingerprint] = userReqestsWithinRateLimitTime;

  if (userReqestsWithinRateLimitTime.length === RATE_LIMIT_MAX_COUNT) {
    const timeFromFirstRequest = Date.now() - userReqestsWithinRateLimitTime[0];

    if (timeFromFirstRequest < RATE_LIMIT_TIME) {
      const remainingTime = RATE_LIMIT_TIME - timeFromFirstRequest;
      const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
      const remainingMinutes = Math.floor(
        (remainingTime % (60 * 60 * 1000)) / (60 * 1000)
      );
      const remainingSeconds = Math.ceil(
        ((remainingTime % (60 * 60 * 1000)) % (60 * 1000)) / 1000
      );

      const remainingHoursLabel = getTimeLabel(remainingHours, "godzin");
      const remainingMunitesLabel = getTimeLabel(remainingMinutes, "minut");
      const remainingSecondsLabel = getTimeLabel(remainingSeconds, "sekund");

      return {
        rateLimitWarning: `Przekroczyłeś limit zapytań, kolejne pytanie będziesz mógł zadać za${
          remainingHoursLabel ? ` ${remainingHoursLabel}` : ""
        }${remainingMunitesLabel ? ` ${remainingMunitesLabel}` : ""}${
          remainingSecondsLabel ? ` ${remainingSecondsLabel}` : ""
        }.`,
      };
    }
  }
};
