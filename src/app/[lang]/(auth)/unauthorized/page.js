import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function UnauthorizedPage() {
  const dict = await getTranslations('unauthorized');
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <div className="flex items-center space-x-4">
        <h1 className="border-r pr-4 text-2xl font-semibold text-black ml-10">401</h1>
        <div className="text-gray-700">
          <p className="text-lg">{dict("error")}</p>
        </div>
      </div>
      <Link href={`/login`} className="text-white mt-7 py-3 px-6 bg-black inline-block rounded-md text-lg hover:border-2 hover:bg-white hover:text-black hover:border-black">
        {dict("loginTitle")}
      </Link>
      {/*<Link href={`/`} className="text-gray-600 mt-2 px-6 inline-block rounded-md text-sm hover:text-black">
        {dict("goHome")}
      </Link>*/}
    </div>
  );
}