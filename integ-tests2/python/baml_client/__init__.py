###############################################################################
#
#  Welcome to Baml! To use this generated code, please run the following:
#
#  $ pip install baml
#
###############################################################################

# This file was generated by BAML: please do not edit it. Instead, edit the
# BAML files and re-generate this code.
#
# ruff: noqa: E501,F401
# flake8: noqa: E501,F401
# pylint: disable=unused-import,line-too-long
# fmt: off
import os
from .client import BamlClient
from . import types

b = BamlClient.from_directory(os.environ.get('BAML_SRC_DIR', f"{__file__}/../baml_src"))


__all__ = [
  "b",
  "types",
]
