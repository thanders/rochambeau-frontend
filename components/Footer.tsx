import ShareButton from "🏝️/ShareButton.tsx";

export default function Footer({ appUrl }: { appUrl: string }) {
  return (
    <footer class="bg-gray-100 py-6 mt-12 text-sm text-gray-700">
      <div class="px-4 mx-auto max-w-screen-md flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4">
        <div class="hidden sm:block">
          <img
            src="/bear-walking.svg"
            alt=""
            role="presentation"
            class="h-12 w-12"
          />
        </div>
        <div class="flex items-center justify-center sm:flex-grow sm:justify-center gap-2">
          <img
            src="/bear-walking.svg"
            alt=""
            role="presentation"
            class="h-12 w-12 sm:hidden"
          />
          <span class="text-center">
            &copy; {new Date().getFullYear()} Rock, Paper, Scissors!
          </span>
        </div>
        <div>
          <ShareButton
            title="Share the App!"
            text="Come play Rock, Paper, Scissors with me!"
            url={appUrl}
          />
        </div>
      </div>
    </footer>
  );
}
