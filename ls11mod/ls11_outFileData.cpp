#include <stdio.h>
#include <stdlib.h>
#pragma pack(1)

#pragma warning(push)
#pragma warning(disable:4996)

//�t�@�C������f�[�^����
int ls11_outFileData(const char *filename, char *out, int outlen){
	FILE	*fp = NULL;
	int		dsize = 0;

	//�t�@�C���I�[�v��
	if((fp = fopen(filename,"wb")) == NULL){
		printf("Output File Open Err");
		return -1;
	} 
	//�t�@�C���Ǎ�
	dsize = fwrite(out,sizeof(char),outlen,fp);
	//�t�@�C���N���[�Y
	fclose(fp);
	return dsize;
}

#pragma warning(pop)
