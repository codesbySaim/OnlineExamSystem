FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY OnlineExam.API/*.csproj OnlineExam.API/
COPY OnlineExam.Core/*.csproj OnlineExam.Core/
COPY OnlineExam.Infrastructure/*.csproj OnlineExam.Infrastructure/

RUN dotnet restore OnlineExam.API/OnlineExam.API.csproj

COPY . .

RUN dotnet publish OnlineExam.API/OnlineExam.API.csproj -c Release -o /app/out

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "OnlineExam.API.dll"]