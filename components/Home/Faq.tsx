import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CircleHelp, PlusIcon } from "lucide-react";
import { cn } from "cn";
import { AnimatedBadge } from "@/components/shadcn-space/badge/badge-08";

const FAQ_DATA = [
  {
    question: "আমি কীভাবে ইউনিক টিচিং মেথডের কোর্স কিনব এবং পড়াশোনা শুরু করব?",
    answer:
      "কোর্স শুরু করা খুবই সহজ। প্রথমে ইউনিক টিচিং মেথডে একটি অ্যাকাউন্ট তৈরি করুন অথবা আপনার অ্যাকাউন্টে লগইন করুন। এরপর আপনার প্রয়োজন ও লক্ষ্য অনুযায়ী পছন্দের কোর্সটি নির্বাচন করে কোর্সের বিস্তারিত তথ্য দেখে নিন। পেমেন্ট সম্পন্ন করার পর কোর্সটি আপনার অ্যাকাউন্টে যুক্ত হয়ে যাবে। এরপর ড্যাশবোর্ডে গিয়ে যেকোনো সময় আপনার কোর্সের লেসন, ক্লাস ও অন্যান্য শিক্ষাসামগ্রী ব্যবহার করে পড়াশোনা শুরু করতে পারবেন।",
  },
  {
    question:
      "একটি অ্যাকাউন্ট সর্বোচ্চ কয়টি ডিভাইসে ব্যবহার করা যাবে? একাধিক ডিভাইসে লগইন করলে কী হবে?",
    answer:
      "একটি অ্যাকাউন্ট সর্বোচ্চ ২টি ডিভাইসে ব্যবহার করা যাবে। যেমন—একটি মোবাইল ফোন এবং একটি ল্যাপটপ বা কম্পিউটার। শিক্ষার্থীদের সুবিধার পাশাপাশি আমাদের কোর্স কনটেন্টের নিরাপত্তা নিশ্চিত করার জন্য এই সীমা রাখা হয়েছে। নির্ধারিত সীমার বেশি ডিভাইস থেকে অ্যাকাউন্টে লগইন করার চেষ্টা করলে আগের কোনো সেশন স্বয়ংক্রিয়ভাবে লগআউট হয়ে যেতে পারে। তাই আপনার অ্যাকাউন্টের তথ্য অন্য কারও সঙ্গে শেয়ার না করাই সবচেয়ে নিরাপদ।",
  },
  {
    question:
      "একবার কোর্স কিনলে কতদিন পর্যন্ত কোর্সের ক্লাস ও শিক্ষাসামগ্রী ব্যবহার করতে পারব?",
    answer:
      "প্রতিটি কোর্সের অ্যাক্সেসের সময়কাল কোর্সভেদে আলাদা হতে পারে। কোনো কোর্সে ৬ মাস, কোনো কোর্সে ১ বছর এবং নির্দিষ্ট কিছু কোর্সে দীর্ঘমেয়াদি বা লাইফটাইম অ্যাক্সেস থাকতে পারে। কোর্স কেনার আগে সংশ্লিষ্ট কোর্সের বিস্তারিত পেজে অ্যাক্সেসের সময়কাল স্পষ্টভাবে উল্লেখ করা থাকবে। তাই ভর্তি হওয়ার আগে কোর্সের মেয়াদ, কী কী কনটেন্ট থাকছে এবং অন্যান্য সুবিধাগুলো দেখে নেওয়ার পরামর্শ দেওয়া হচ্ছে।",
  },
  {
    question:
      "ইউনিক টিচিং মেথডের ভিডিও ক্লাস কি ডাউনলোড করে অফলাইনে দেখা যাবে?",
    answer:
      "আমাদের ভিডিও কনটেন্ট শিক্ষার্থীদের নিরাপত্তা ও কনটেন্ট সুরক্ষার কথা মাথায় রেখে সুরক্ষিতভাবে প্রদান করা হয়। তাই সাধারণভাবে ভিডিও ক্লাস সরাসরি ডাউনলোড করে অন্য জায়গায় সংরক্ষণ বা শেয়ার করার সুবিধা থাকবে না। শিক্ষার্থীরা তাদের অ্যাকাউন্টে লগইন করে অনুমোদিত ডিভাইস থেকে অনলাইনে ক্লাসগুলো দেখতে পারবে। এতে কোর্সের কনটেন্ট সুরক্ষিত থাকার পাশাপাশি সকল শিক্ষার্থীর জন্য একটি নিরাপদ ও নিয়ন্ত্রিত শিক্ষার পরিবেশ বজায় রাখা সম্ভব হবে।",
  },
  {
    question:
      "কোর্স করার সময় কোনো সমস্যা হলে বা কোনো বিষয়ে সাহায্যের প্রয়োজন হলে কীভাবে সাপোর্ট পাব?",
    answer:
      "কোর্স করার সময় লগইন, পেমেন্ট, ক্লাস অ্যাক্সেস বা অন্য কোনো কারিগরি সমস্যার সম্মুখীন হলে চিন্তার কোনো কারণ নেই। আপনি আপনার ড্যাশবোর্ডের Support অপশন ব্যবহার করে আমাদের সঙ্গে যোগাযোগ করতে পারবেন। প্রয়োজন হলে লাইভ চ্যাট, WhatsApp অথবা Facebook Inbox-এর মাধ্যমেও যোগাযোগ করা যাবে। আপনার সমস্যাটি যতটা সম্ভব পরিষ্কারভাবে জানালে আমাদের টিম বিষয়টি বুঝে প্রয়োজনীয় সহযোগিতা করার চেষ্টা করবে।",
  },
  {
    question:
      "কোর্সে ভর্তি হওয়ার আগে আমি কি কোর্সের বিষয়বস্তু ও অন্যান্য তথ্য জানতে পারব?",
    answer:
      "অবশ্যই। প্রতিটি কোর্সের পেজে কোর্সটি কাদের জন্য, কী কী বিষয় পড়ানো হবে, কোন কোন অধ্যায় বা লেসন থাকবে এবং কোর্স থেকে কী ধরনের সুবিধা পাওয়া যাবে—এসব গুরুত্বপূর্ণ তথ্য দেওয়া থাকবে। ভর্তি হওয়ার আগে কোর্সের বিস্তারিত তথ্য দেখে আপনার প্রয়োজনের সঙ্গে মিলিয়ে সিদ্ধান্ত নিতে পারবেন। এতে আপনি আপনার লক্ষ্য ও প্রস্তুতির জন্য সঠিক কোর্সটি বেছে নিতে আরও সহজে সিদ্ধান্ত নিতে পারবেন।",
  },
  {
    question: "মোবাইল ফোন দিয়ে কি ইউনিক টিচিং মেথডের কোর্স করা যাবে?",
    answer:
      "হ্যাঁ। ইউনিক টিচিং মেথড এমনভাবে তৈরি করা হচ্ছে যাতে শিক্ষার্থীরা শুধু কম্পিউটার বা ল্যাপটপের ওপর নির্ভরশীল না হয়ে মোবাইল ফোন থেকেও সহজে তাদের পড়াশোনা চালিয়ে যেতে পারে। আপনার ডিভাইস ও ইন্টারনেট সংযোগ অনুযায়ী কোর্সের ভিডিও, লেসন এবং অন্যান্য শিক্ষাসামগ্রী ব্যবহার করতে পারবেন। তবে দীর্ঘ সময় পড়াশোনা বা বড় স্ক্রিনে কনটেন্ট দেখার ক্ষেত্রে ল্যাপটপ বা কম্পিউটার ব্যবহার করলে অনেকের জন্য আরও আরামদায়ক হতে পারে।",
  },
];

export default function Faq() {
  const Icon = CircleHelp;

  return (
    <section>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:gap-12 sm:px-6 sm:py-14 lg:gap-16 lg:px-8 xl:py-24">
        {/* Header */}
        <div className="flex w-full flex-col items-center text-center">
          <AnimatedBadge
            label="FAQ"
            className="mb-3 sm:mb-4 text-xs sm:text-sm"
            icon={<Icon className="size-3.5 sm:size-4" />}
          />

          <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-4xl lg:text-5xl">
            <span className="dark:text-white text-black">সাধারণ</span> জিজ্ঞাসা
          </h2>

          <p className="mt-2.5 max-w-2xl text-xs leading-5 text-muted-foreground sm:mt-4 sm:text-base sm:leading-7 lg:text-lg">
            ইউনিক টিচিং মেথড সম্পর্কে আপনার মনে থাকা সাধারণ প্রশ্নগুলোর উত্তর এক
            জায়গায় জেনে নিন।
          </p>
        </div>

        {/* FAQ */}
        <div>
          <Accordion
            type="single"
            collapsible
            className="flex w-full flex-col gap-3 sm:gap-4"
          >
            {FAQ_DATA.map((faq, index) => (
              <AccordionItem
                key={`item-${index}`}
                value={`item-${index}`}
                className={cn(
                  "group/item flex flex-col gap-2 rounded-xl border border-primary/20 p-4 transition-all sm:gap-3 sm:rounded-2xl sm:p-6 lg:p-7",
                  "hover:border-primary/40",
                  "data-[open]:border-primary data-[open]:bg-primary/5",
                  "animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both",
                  index === 0 && "delay-100",
                  index === 1 && "delay-200",
                  index === 2 && "delay-300",
                  index === 3 && "delay-400",
                  index === 4 && "delay-500",
                  index === 5 && "delay-600",
                  index === 6 && "delay-700",
                )}
              >
                <AccordionTrigger
                  className={cn(
                    "cursor-pointer p-0 text-left text-sm font-semibold leading-snug sm:text-lg sm:leading-normal lg:text-xl",
                    " hover:no-underline",
                    "**:data-[slot=accordion-trigger-icon]:hidden",
                  )}
                >
                  <span className="pr-2">{faq.question}</span>

                  <PlusIcon
                    className={cn(
                      "h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6",
                      "transition-transform duration-200",
                      "group-aria-expanded/accordion-trigger:rotate-45",
                    )}
                  />
                </AccordionTrigger>

                <AccordionContent className="p-0 pt-1 text-xs leading-6 text-muted-foreground sm:text-base sm:leading-7 lg:text-lg lg:leading-8">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
