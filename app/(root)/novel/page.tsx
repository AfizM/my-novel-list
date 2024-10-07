import React from "react";
import { Star, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NovelPage() {
  const ratings = 3.94;
  const totalRatings = 279;
  const tags = [
    "Action",
    "Adventure",
    "Fantasy",
    "Isekai",
    "Adventure",
    "Fantasy",
    "Isekai",
    "Adventure",
    "Fantasy",
    "Isekai",
  ];

  return (
    <div>
      {" "}
      <div className="w-full max-w-7xl mx-auto my-0 px-9">
        <div className="flex mt-4 p-4">
          {/* Image */}
          <div className=" flex flex-col items-center mr-2">
            <img
              src="img/novel1.jpg"
              alt=""
              className="w-full max-w-56 object-cover rounded-md"
            />
            <Button className="mt-2 w-full relative max-w-52">
              Add to list
              <ChevronDown className="absolute right-2" />
            </Button>
          </div>

          <div className="flex-col ml-4 space-y-3 max-w-[800px] p-2">
            {/* Title */}
            <div className="text-3xl font-bold">
              Regressor's tale of Cultivation
            </div>
            <div>
              {/* Ratings */}
              <div className="flex">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} fill="orange" strokeWidth={0} />
                ))}
                <div className="ml-2 font-semibold ">
                  {ratings} Ratings ({totalRatings})
                </div>
              </div>
            </div>
            {/* Description */}
            <div className="w-full max-w-[800px]">
              On the way to a company workshop, we fell into a world of immortal
              cultivators while still in the car. Those with spiritual roots and
              unique abilities were all called to join cultivation sects, living
              prosperously. But I, having neither spiritual roots nor special
              abilities, lived as an ordinary mortal for 50 years, complying
              with fate until my death. That’s what I thought. Until I
              regressed.
            </div>
            <div>
              <span className="font-semibold text-sm">Author: </span>{" "}
              <span className="text-primary underline cursor-pointer text-sm">
                {" "}
                Tremendous
              </span>
            </div>
            <div>
              <span className="font-semibold text-sm">Publisher:</span>{" "}
              <span className="text-primary underline cursor-pointer text-sm">
                {" "}
                Munipia
              </span>
            </div>

            {/* Tags */}
            <div className="flex-wrap flex  ">
              <div className="mr-2">
                <span className="font-semibold text-sm">Tags:</span>{" "}
              </div>
              {tags.map((tag, index) => (
                <Badge className="mr-2 mb-2 cursor-pointer " key={index}>
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Genres */}
            <div className="flex-wrap flex ">
              <div className="mr-2">
                <span className="font-semibold text-sm">Genres:</span>{" "}
              </div>
              {tags.map((tag, index) => (
                <Badge className="mr-2 mb-2 cursor-pointer " key={index}>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="text-3xl mt-6 font-bold">Reviews</div>
        <Card className="mt-2 max-w-[1000px]">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              a great premise with poor execution first off As stated by a
              previous reviewer, his regressions are also super formulaic. He
              gets depressed, gets a eureka moment before dying, regress, gets
              hopeful and repeat. secondly, the wordcount extendinator or as the
              author would call it, calling out attack moves of a 20+ combo. And
              I mean each strike, followed by effects like boom or whoosh
              lastly, the biggest gripe I have with this is that for some
            </p>
          </CardContent>
        </Card>
        <Card className="mt-2">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              a great premise with poor execution first off As stated by a
              previous reviewer, his regressions are also super formulaic. He
              gets depressed, gets a eureka moment before dying, regress, gets
              hopeful and repeat. secondly, the wordcount extendinator or as the
              author would call it, calling out attack moves of a 20+ combo. And
              I mean each strike, followed by effects like boom or whoosh
              lastly, the biggest gripe I have with this is that for some
              reason, even with the knowledge that he is WAAAAAY far off from
              ending his regressions, he still gets attached and creates
              emotional connections to others. This is the same as stabbing
              yourself to feel something, the worst part is that the author
              claims, he acknowledges this, the character itself doesn't. By the
              same vein as immortality, continuous regressors tend to cut
              themselves off from others emotionally as in the end only the
              regressor will hold the memory of what happened.
            </p>
          </CardContent>
        </Card>
        <Card className="mt-2 ">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              a great premise with poor execution first off As stated by a
              previous reviewer, his regressions are also super formulaic. He
              gets depressed, gets a eureka moment before dying, regress, gets
              hopeful and repeat. secondly, the wordcount extendinator or as the
              author would call it, calling out attack moves of a 20+ combo. And
              I mean each strike, followed by effects like boom or whoosh
              lastly, the biggest gripe I have with this is that for some
              reason, even with the knowledge that he is WAAAAAY far off from
              ending his regressions, he still gets attached and creates
              emotional connections to others. This is the same as stabbing
              yourself to feel something, the worst part is that the author
              claims, he acknowledges this, the character itself doesn't. By the
              same vein as immortality, continuous regressors tend to cut
              themselves off from others emotionally as in the end only the
              regressor will hold the memory of what happened.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
