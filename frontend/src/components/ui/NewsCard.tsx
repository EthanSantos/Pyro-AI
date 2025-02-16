import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { SquareArrowOutUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const NewsCard = (
    {title, tag, source, date, content, link}
    :
    {title: String, tag: String, source: String, date: String, content: String, link: String}
) => {
    return(
        <Card className="min-w-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl pb-1">{title}</CardTitle>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline">{tag}</Badge>
                    <CardDescription>{source}</CardDescription>
                    <CardDescription>•</CardDescription>
                    <CardDescription>{date}</CardDescription>
                </div>
            </CardHeader>

            <CardContent className="w-[95%] pb-4 text-sm">
                <p>{content}</p>
            </CardContent>

            <CardFooter className="items-start justify-end">
                <SquareArrowOutUpRight /> {/** TODO: Make this icon clickable + link it to website with more info. */}
            </CardFooter>
        </Card>
    )
}

export default NewsCard