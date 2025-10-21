import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userProfile } from "@/lib/placeholder-data";
import PricingCard from "../components/PricingCard";
import { pricingPlans } from "@/lib/placeholder-data";

export default function PerfilPage() {
  const creditPercentage = (userProfile.credits / userProfile.totalCredits) * 100;

  return (
    <div className="container mx-auto py-12">
      <div className="grid gap-10 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={userProfile.avatar.imageUrl} alt={userProfile.name} data-ai-hint={userProfile.avatar.imageHint} />
            <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{userProfile.name}</h2>
          <p className="text-sm text-muted-foreground">{userProfile.email}</p>
        </div>
        <div className="grid gap-10">
          <Card>
            <CardHeader>
              <CardTitle>Tu Plan Actual</CardTitle>
              <CardDescription>Estás en el {userProfile.subscription}.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold">Créditos Restantes</p>
                <div className="flex items-center gap-4">
                  <Progress value={creditPercentage} className="w-[60%]" />
                  <span className="font-bold">{userProfile.credits.toLocaleString()} / {userProfile.totalCredits.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Tabs defaultValue="stories">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stories">Mis Cuentos</TabsTrigger>
              <TabsTrigger value="subscription">Suscripción</TabsTrigger>
            </TabsList>
            <TabsContent value="stories">
              <Card>
                <CardHeader>
                  <CardTitle>Mis Cuentos Creados</CardTitle>
                  <CardDescription>Aquí encontrarás todas tus creaciones mágicas.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProfile.stories.map((story) => (
                     <Card key={story.id} className="overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                        <Link href="#">
                        <CardContent className="p-0">
                            <Image
                            src={story.image.imageUrl}
                            alt={story.title}
                            width={400}
                            height={600}
                            className="w-full h-auto object-cover aspect-[2/3]"
                            data-ai-hint={story.image.imageHint}
                            />
                        </CardContent>
                        <CardHeader>
                            <CardTitle className="text-lg">{story.title}</CardTitle>
                        </CardHeader>
                        </Link>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>Gestionar Suscripción</CardTitle>
                  <CardDescription>Cambia de plan para obtener más créditos y beneficios.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pricingPlans.filter(p => p.name !== 'Pay as you go').map(plan => (
                        <div key={plan.name} className="flex flex-col">
                            <PricingCard plan={{
                                ...plan,
                                isFeatured: plan.name === userProfile.subscription,
                                cta: plan.name === userProfile.subscription ? "Plan Actual" : "Cambiar Plan"
                            }}/>
                        </div>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
