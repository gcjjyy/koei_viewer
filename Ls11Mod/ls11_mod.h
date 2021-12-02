#pragma once

#include "ls11_lib.h"
#include <vector>


using namespace std;

// LS11��***.n6p�����A�o���o���ɕ�������BLS11 Archiever��z������Ηǂ��B
// �t�@�C���ɕ������邾���ł͂Ȃ��A�ϐ��Ɋi�[���邱�Ƃ��o����B
int ls11_DecodePack(char *szInputFileName, char *szOutputPattern, vector<vector<byte>> *pvecDstDataArray=NULL);

// �t�@�C���A���邢�́A�ϐ��̃f�[�^���A�P��LS11�t�@�C���Ƀp�b�N������B
int ls11_EncodePack(char *szOutputFileName, char *szInputPattern, vector<vector<byte>> *pvecSrcDataArray=NULL, vector<byte> *pDstLS11PackedData=NULL);


// �P�̈�����o�C�i���f�[�^���A�Ӗ��P�ʂŕ�������
void ls11_SplitData(vector<byte> &vSrcJoinedData, vector<vector<byte>> *vDstSplittedData);

// �����������̂����ւƖ߂��B
void ls11_JoinData(vector<vector<byte>> &vSrcSplittedData, vector<byte> *vDstJoinedData);
