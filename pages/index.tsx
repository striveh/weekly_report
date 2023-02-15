import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from 'next-intl'
import { Toaster, toast } from "react-hot-toast";
import DropDown, { FormType } from "../components/DropDown";
import Footer from "../components/Footer";
import Github from "../components/GitHub";

import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";
import ResizablePanel from "../components/ResizablePanel";
import { marked } from "marked";

const Home: NextPage = () => {
  const t = useTranslations('Index')

  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState("");
  const [form, setForm] = useState<FormType>("paragraphForm");
  const [api_key, setAPIKey] = useState("")
  const [generatedChat, setGeneratedChat] = useState<String>("");

  console.log("Streamed response: ", generatedChat);

  const prompt =
    form === 'paragraphForm'?
      `${t('prompt')}${chat}`
      : `${t('prompt')}${chat}`;

  const useUserKey = process.env.NEXT_PUBLIC_USE_USER_KEY === "true" ? true : false;

  const generateChat = async (e: any) => {
    e.preventDefault();
    setGeneratedChat("");
    setLoading(true);

    const response = useUserKey ?
      await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          api_key,
        }),
      })
    :
      await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      })

    console.log("Edge function returned.");

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value).replace("<|im_end|>", "");
      setGeneratedChat((prev) => prev + chunkValue);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-5xl min-h-screen py-2 mx-auto">
      <Head>
        <title>{t('title')}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="flex flex-col items-center justify-center flex-1 w-full px-4 mt-12 text-center sm:mt-20">
        


      <a
          className="flex items-center justify-center px-4 py-2 mb-5 space-x-2 text-sm text-gray-600 transition-colors bg-white border border-gray-300 rounded-full shadow-md max-w-fit hover:bg-gray-100"
          href="https://github.com/guaguaguaxia/weekly_report"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github />
          <p>Star on GitHub</p>
        </a>



        <h1 className="max-w-2xl text-4xl font-bold sm:text-6xl text-slate-900">
          {t('description1')} <br></br><div               className="w-full px-4 py-2 mt-8  sm:mt-3 hover:bg-black/80"></div>{t('description2')}
        </h1>
        <p className="mt-5 text-slate-500">{t('slogan')}</p>

        <div className="w-full max-w-xl">
          { useUserKey &&(
            <>

              <input
                  value={api_key}
                  onChange={(e) => setAPIKey(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-md shadow-sm focus:border-black focus:ring-black"
                  placeholder={
                    t('openaiApiKeyPlaceholder')
                  }
                />
            </>)
          }

          <div className="flex items-center mt-10 space-x-3">
            <Image
              src="/1-black.png"
              width={30}
              height={30}
              alt="1 icon"
              className="mb-5 xs:mb-0"
            />
            <p className="font-medium text-left">
              {t('step1')}{" "}
            </p>
          </div>

          <textarea
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            rows={4}
            className="w-full my-2 border-gray-300 rounded-md shadow-sm focus:border-black focus:ring-black"
            placeholder={
              t('placeholder')
            }
          />

          {!loading && (
            <button
              className="w-full px-4 py-2 mt-8 font-medium text-white bg-black rounded-xl sm:mt-5 hover:bg-black/80"
              onClick={(e) => generateChat(e)}
            >
              {t('simplifierButton')} &rarr;
            </button>
          )}
          {loading && (
            <button
              className="w-full px-4 py-2 mt-8 font-medium text-white bg-black rounded-xl sm:mt-10 hover:bg-black/80"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          )}
          
          <br></br>
          <br></br>
          <div className="items-center mt-1 space-x-3">
            <span className="text-slate-200">
                {t('privacyPolicy1')}
              <a
                className="text-blue-200 hover:text-blue-400"
                href="https://github.com/guaguaguaxia/weekly_report/blob/main/privacy.md"
                target="_blank"
                rel="noopener noreferrer"
              >{' '}{t('privacyPolicy2')}</a>
            </span>
          </div>
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <ResizablePanel>
          <AnimatePresence mode="wait">
            <motion.div className="my-10 space-y-10">
              {generatedChat && (
                <>
                  <div>
                    <h2 className="mx-auto text-3xl font-bold sm:text-4xl text-slate-900">
                      {t('simplifiedContent')}
                    </h2>
                  </div>
                  <div className="flex flex-col items-center justify-center max-w-xl mx-auto space-y-8">
                    <div
                      className="p-4 transition bg-white border shadow-md rounded-xl hover:bg-gray-100 cursor-copy"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedChat.trim());
                        toast("Chat copied to clipboard", {
                          icon: "✂️",
                        });
                      }}
                    >
                      {/* <p className="sty1">{generatedChat}</p> */}
                      <p
                        className="sty1 markdown-body"
                        dangerouslySetInnerHTML={{
                          __html: marked(generatedChat.toString(), {
                            gfm: true,
                            breaks: true,
                            smartypants: true
                          }),
                        }}
                      ></p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </ResizablePanel>
      </main>
      <Footer />
    </div>
  );
};

export default Home;

export function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      messages: {
        ...require(`../messages/${locale}.json`),
      },
    },
  }
}
