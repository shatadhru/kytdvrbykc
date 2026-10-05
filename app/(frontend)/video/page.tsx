import ClassroomView from '@/components/basic/video-player/ClassroomView'

export const dynamic = 'force-dynamic'

export default function VideoPage() {
  const courseData = {
    id: 'ssc-2028',
    title: 'এসএসসি ২০২৮ বেসিক টু প্রিমিয়াম কোর্স',
    description: 'সম্পূর্ণ সুরক্ষিত ও পাইরেসি মুক্ত প্রিমিয়াম ভিডিও ক্লাস প্ল্যাটফর্ম।',
    subjects: [
      { name: 'Physics', slug: 'physics', description: 'পদার্থবিজ্ঞান' },
      { name: 'Chemistry', slug: 'chemistry', description: 'রসায়ন' },
    ],
  }

  const classList = [
    {
      id: 'class-1',
      title: 'রসায়ন পরিচিতি ও পরমাণুর গঠন',
      subjectSlug: 'chemistry',
      order: 1,
      duration: '45m',
      isFreePreview: true,
      videoSource: 'https://youtu.be/oXtkoxmIiCc',
    },
    {
      id: 'class-2',
      title: 'পদার্থবিজ্ঞান গতি ও বল (Newtonian Mechanics)',
      subjectSlug: 'physics',
      order: 2,
      duration: '50m',
      isFreePreview: false,
      videoSource: 'https://youtu.be/Ce5NRFL8Kao',
    },
  ]

  return <ClassroomView course={courseData} initialClasses={classList} />
}
