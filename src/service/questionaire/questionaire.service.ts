import prisma from "@/utils/prisma.util";
import { Prisma, UserMediaAnswer } from "@prisma/client";import { IQuestionInfo, IQuestionOption, IQuestionaireInfo, IUserAnswerRequest } from "@/model/questionaire/questionaire";
import { accountService } from "..";
import { v4 } from "uuid";

class QuestionaireService {
  
  public getAllQuestionaires = async(): Promise<IQuestionaireInfo[]> => {
    const include: Prisma.QuestionaireInclude = {
      questions: {
        include: {
          questionOptions: true
        }
      },
    };

    const questionaireDbs = await prisma.questionaire.findMany({ 
      where: { active: true }, 
      include
     });
     
    const questionaires: IQuestionaireInfo[] = questionaireDbs.map(questionaireDb => {
      let questions = questionaireDb.questions?.sort(function(a: any, b: any) {return a.displayOrder - b.displayOrder}).map((questionDb: any) => {
        let question: IQuestionInfo = {
          description: questionDb.description,
          id: questionDb.id,
          point: questionDb.point ?? undefined,
          title: questionDb.title,
          type: questionDb.type,
          subActions: questionDb.subActions ? JSON.parse(questionDb.subActions) : null,
          options: questionDb.questionOptions.sort(function(a: any, b: any) {return a.displayOrder - b.displayOrder}).map((optionDb: any) => {
            let option: IQuestionOption = {
              description: optionDb.description,
              id: optionDb.id,
              title: optionDb.title,
              type: optionDb.type,
              point: optionDb.point,
            };
            return option;
          })
        };
        return question;
      });
      let questionaire: IQuestionaireInfo = {
        id: questionaireDb.id,
        isLiked: questionaireDb.isLiked,
        isWatched: questionaireDb.isWatched,
        questions: questions ?? []
      };

      return questionaire;
    });
    
    return questionaires;
  }
  
  public getQuestionaireById = async(questionaireId: string): Promise<IQuestionaireInfo|undefined> => {
    const include: Prisma.QuestionaireInclude = {
      questions: {
        include: {
          questionOptions: true
        }
      },
    };

    const questionaireDb = await prisma.questionaire.findFirst({ 
      where: { 
        AND: [
          { active: true },
          { id: questionaireId }
        ]
      }, 
      include
     });

    if (!questionaireDb) {
      return;
    }
    
    const questions= questionaireDb.questions?.sort(function(a: any, b: any) {return a.displayOrder - b.displayOrder}).map((questionDb: any) => {
      let question: IQuestionInfo = {
        description: questionDb.description,
        id: questionDb.id,
        point: questionDb.point ?? undefined,
        title: questionDb.title,
        type: questionDb.type,
        subActions: questionDb.subActions ? JSON.parse(questionDb.subActions) : null,
        options: questionDb.questionOptions.sort(function(a: any, b: any) {return a.displayOrder - b.displayOrder}).map((optionDb: any) => {
          let option: IQuestionOption = {
            description: optionDb.description,
            id: optionDb.id,
            title: optionDb.title,
            type: optionDb.type,
            point: optionDb.point,
          };
          return option;
        })
      };
      return question;
    });

    const questionaire: IQuestionaireInfo = {
      id: questionaireDb.id,
      isLiked: questionaireDb.isLiked,
      isWatched: questionaireDb.isWatched,
      questions: questions ?? []
    };
      
    return questionaire;
  }

}

const questionaireService = new QuestionaireService();

export default questionaireService;
