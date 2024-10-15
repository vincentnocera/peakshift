import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"


const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <Card className="text-foreground p-8 rounded-lg w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Let&apos;s Begin</CardTitle>
        </CardHeader>
        <div className="flex justify-between space-x-4">
          <Button asChild className="flex-1">
            <Link href="/case-simulator-selection">
              Case Simulator
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/under-construction">
              Review Literature
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Home;
