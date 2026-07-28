import { format } from "date-fns/format";

type GuestbookEntry = {
  n: string; // name
  m: string; // message
  d: string; // date
};

type GuestbookResponse = {
  l: string; // last page
  p: string; // current page
  d: string; // page data
};

async function getGuestbookPage(
  kv: KVNamespace<string>,
  page: string,
): Promise<Response> {
  const lastPage = await kv.get("lastpage");
  const pageData = await kv.get(page);

  return new Response(
    JSON.stringify({
      l: lastPage ?? "0",
      p: page,
      d: pageData ?? "[]",
    } as GuestbookResponse),
  );
}

async function addGuestbookEntry(
  kv: KVNamespace<string>,
  name: string,
  message: string,
): Promise<Response> {
  try {
    const lastPage = await kv.get("lastpage");
    const strPageData = await kv.get(lastPage ?? "0");

    const pageData = JSON.parse(strPageData ?? "[]") as GuestbookEntry[];

    if (pageData.length + 1 > 5) {
      // we create a new page
      const nextPage = Number.parseInt(lastPage ?? "0") + 1;

      const strNewPageData = JSON.stringify([
        {
          n: name,
          m: message,
          d: format(new Date(), "MM/dd/yyyy"),
        },
      ]);

      await kv.put("lastpage", `${nextPage}`);
      await kv.put(`${nextPage}`, strNewPageData);
    } else {
      pageData.push({
        n: name,
        m: message,
        d: format(new Date(), "MM/dd/yyyy"),
      });

      const strNewPageData = JSON.stringify(pageData);

      await kv.put(lastPage ?? "0", strNewPageData);
    }

    return new Response("true");
  } catch (e) {
    return new Response("false");
  }
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === "POST") {
    const body = (await context.request.json()) as any;

    const { n, m } = body;

    if (typeof n === "string" && typeof m === "string") {
      return await addGuestbookEntry(context.env.KV, n, m);
    }
  } else if (context.request.method === "GET") {
    const url = new URL(context.request.url);
    const page = url.searchParams.get("p");

    if (page === null) {
      return await getGuestbookPage(context.env.KV, "0");
    } else {
      return await getGuestbookPage(context.env.KV, page);
    }
  }
  return new Response();
};
